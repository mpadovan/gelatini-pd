import puppeteer, { Browser, ElementHandle } from 'puppeteer';
import {save as SaveSlots} from '../helpers/slots'
import fetchProducts from '../helpers/fetchProducts';
import mongoose from "mongoose";

const config = useRuntimeConfig();

async function DBConnect() {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log("DB connection established.");
  } catch (err) {
    console.error("DB connection failed.", err);
  }
};

export type ConadProductDesc = {
  name: string | null | undefined;
  price: string | null | undefined;
  desc: string | null | undefined;
  slots: number | undefined;
};

export default defineEventHandler(async (event) => {
	try {
    await DBConnect();
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
