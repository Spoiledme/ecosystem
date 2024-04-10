import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { and, count, eq } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import type { NameCursor } from '@/api'
import type { Database } from '@/db'

import { entities } from './entities'
import { generateCursorSelect } from './utils'

export enum AppState {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export const apps = pgTable(
  'apps',
  {
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    entityId: uuid('entity_id')
      .references(() => entities.id)
      .notNull(),
    chainId: integer('chain_id'),
    name: varchar('name').notNull(),
    state: varchar('state')
      .$type<AppState>()
      .default(AppState.ACTIVE)
      .notNull(),
  },
  (table) => {
    return {
      entityIdx: index().on(table.entityId),
      nameIdx: index().on(table.name),
    }
  },
)

export type App = InferSelectModel<typeof apps>
export type InsertApp = InferInsertModel<typeof apps>

export const getActiveAppsForEntityByCursor = async (input: {
  db: Database
  entityId: App['entityId']
  limit: number
  cursor?: NameCursor
}) => {
  const { db, entityId, limit, cursor } = input

  return generateCursorSelect({
    db,
    table: apps,
    filters: [eq(apps.entityId, entityId), eq(apps.state, AppState.ACTIVE)],
    limit,
    orderBy: { direction: 'asc', column: 'name' },
    idColumnKey: 'id',
    cursor,
  })
}

export const getActiveAppsCount = async (input: {
  db: Database
  entityId: App['entityId']
}) => {
  const { db, entityId } = input

  const results = await db
    .select({ count: count() })
    .from(apps)
    .where(and(eq(apps.entityId, entityId), eq(apps.state, AppState.ACTIVE)))

  return results[0]?.count || 0
}

export const insertApp = async (input: { db: Database; newApp: InsertApp }) => {
  const { db, newApp } = input
  const result = await db.insert(apps).values(newApp).returning()

  return result[0]
}
