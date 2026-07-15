import type { ExpenseItem, Member } from '../types'

/** 單筆花費列的成員孤兒參照描述。 */
export interface OrphanMemberRef {
  expense: ExpenseItem
  orphanPayer: boolean
  orphanParticipantIds: string[]
}

/**
 * 找出「payerId 或 participantIds 指向已不存在成員」的花費列。
 * payerId === '' 或未設視為未指定，不算孤兒；participantIds 為空／未設視為全體均分，不算孤兒。
 * 回傳保持輸入順序，只包含至少有一種孤兒問題的列。
 */
export function findOrphanMemberRefs(
  expenses: ExpenseItem[],
  members: Array<Pick<Member, 'id'>>,
): OrphanMemberRef[] {
  const idSet = new Set<string>()
  for (const m of members) idSet.add(m.id)
  const out: OrphanMemberRef[] = []
  for (const e of expenses) {
    const orphanPayer = !!e.payerId && !idSet.has(e.payerId)
    const orphanParticipantIds = (e.participantIds ?? []).filter((id) => !idSet.has(id))
    if (orphanPayer || orphanParticipantIds.length > 0) {
      out.push({ expense: e, orphanPayer, orphanParticipantIds })
    }
  }
  return out
}
