#!/usr/bin/env bash
# Stop hook：做完原始碼/檔案修改後，提醒把「最新狀況」更新到 CLAUDE.md。
#
# 行為：
#   1. 若 CLAUDE.md 在工作目錄已有變更 → 視為已更新，放行（exit 0）。
#   2. 若有實質變更（排除 .claude/ 工具設定與 CLAUDE.md 本身）但 CLAUDE.md 沒動
#      → 以 decision:block 把提醒餵回給 Claude，請它更新文件後再結束。
#   3. stop_hook_active 迴圈保護：同一次續跑不再重複攔截，避免卡死。
#
# 任何非預期狀況一律安靜放行（exit 0），絕不阻斷正常結束流程。

input="$(cat 2>/dev/null || true)"

# (3) 迴圈保護：已是 stop hook 觸發的續跑就放行
if printf '%s' "$input" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# 定位專案根目錄
root="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$root" ]; then
  root="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
fi
cd "$root" 2>/dev/null || exit 0

# 僅在 git repo 內運作
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# (1) CLAUDE.md 已有工作目錄變更 → 視為已更新，放行
if [ -n "$(git status --porcelain -- CLAUDE.md 2>/dev/null)" ]; then
  exit 0
fi

# (2) 偵測實質變更：排除 .claude/ 與 CLAUDE.md 本身
sub="$(git status --porcelain -- . ':(exclude).claude' ':(exclude)CLAUDE.md' 2>/dev/null || true)"
if [ -n "$sub" ]; then
  reason="偵測到本回合有原始碼/檔案修改，但尚未更新 CLAUDE.md。請依這次的變更更新 CLAUDE.md 的相關章節（例如「## 7. 已完成（截至目前）」或「## 9. 尚未完成 / Roadmap」），把最新狀況記錄進去後再結束。若這次變更確實不需要動文件（例如純粹的暫存/實驗、或只改了文件本身），請在回覆中簡述原因即可，本提醒不會重複攔截。"
  jq -cn --arg r "$reason" '{decision:"block", reason:$r}'
  exit 0
fi

exit 0
