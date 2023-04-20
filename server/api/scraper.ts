import puppeteer, { Browser, ElementHandle } from 'puppeteer';
import {save as SaveSlots} from '../helpers/slots'
import fetchProducts from '../helpers/fetchProducts';

export type ConadProductDesc = {
  name: string | null | undefined;
  price: string | null | undefined;
  desc: string | null | undefined;
  slots: number | undefined;
};

export default defineEventHandler(async (event) => {
	try {
    const items = await fetchProducts();
    return {
      status: 'ok',
      items,
    }
	} catch(err: any) {
    return {
      status: 'ko',
      error: err
    }
	}
})
