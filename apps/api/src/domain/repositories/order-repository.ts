import type { Order } from '../entities/order.js'

export interface OrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order>
  findById(id: string): Promise<Order | null>
  findByMerchantOrderId(merchantOrderId: string): Promise<Order | null>
  findByUserId(userId: string): Promise<Order[]>
  listAll(): Promise<Order[]>
  save(order: Order): Promise<Order>
}
