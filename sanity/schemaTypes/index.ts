import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { orderType } from './orderType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, orderType],
}