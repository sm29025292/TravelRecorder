#!/usr/bin/env bash
# 把 Google 地圖短網址展開成長網址（只追 HTTP 轉址、不下載頁面內容）。
# 用法：bash expand-url.sh <url> [<url> ...]   → 每行輸出「原網址<TAB>長網址」；
# 已是長網址則原樣輸出；展開失敗輸出「原網址<TAB>ERROR」。
for u in "$@"; do
  case "$u" in
    *maps.app.goo.gl*|*goo.gl/maps*)
      long=$(curl -sS -o /dev/null -L --max-redirs 5 --max-time 15 \
        -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36' \
        -w '%{url_effective}' "$u" 2>/dev/null)
      if [ -z "$long" ] || [ "$long" = "$u" ]; then
        printf '%s\tERROR\n' "$u"
      else
        printf '%s\t%s\n' "$u" "$long"
      fi
      ;;
    *) printf '%s\t%s\n' "$u" "$u" ;;
  esac
done
