import {ConadProductDesc} from '../api/scraper';
import slots from '../models/slots';

export async function save(items: ConadProductDesc[]): Promise<void> {
  for (const item of items) {
    await slots.updateOne({
      name: item.name,
    }, {
      $set: {
        price: item.price,
        pricePerSlot: Math.round(parseFloat(item.price?.replace('€', '')?.replace(',', '.') || "1") / (item?.slots || 1) * 100) / 100
      },
      $setOnInsert: {
        name: item.name,
        totalSlots: item.slots,
      }
    }, {
      upsert: true,
      new: true,
    })
  }
  return;
}

export async function reserveSlots(item: string, slots: number): Promise<void> {
  return;
}
