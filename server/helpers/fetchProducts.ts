import puppeteer, { Browser, ElementHandle } from "puppeteer";
import { ConadProductDesc } from "../api/scraper";
import {save as SaveSlots} from "../helpers/slots";

export default async function fetchProducts(): Promise<ConadProductDesc[]> {
  let browser: Browser;
  browser = await startBrowser();
  let items = await scrapingDefinition.scraper(browser);
  items = await slotsFormatting(items);
  await SaveSlots(items);
  return items;
}

 async function startBrowser(): Promise<Browser>{
	try {
    console.log("Opening the browser......");
    const browser: Browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-setuid-sandbox"],
        'ignoreHTTPSErrors': true
    });
    return browser;
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
      throw new Error("Cannot launch scraping :(");
	}
}

const scrapingDefinition = {
  url: 'https://spesaonline.conad.it/search?query=gelato&page=',
  async scraper(browser: Browser) {
    let purchasables: ConadProductDesc[] = [];
    for (let iterator of [1,2,3]) {
      let page = await browser.newPage();
      const pageUrl = this.url+iterator;
      console.log(`Navigating to ${pageUrl}...`);
      // Navigate to the selected page
      await page.goto(pageUrl);
      await page.evaluate(() => {
        localStorage.setItem('storeSelected', '"{\"address\":{\"id\":\"8796157149207\",\"formattedAddress\":\"SESTIERE CANNAREGIO, 3027, Veneto, VENEZIA, 30100\",\"line1\":\"SESTIERE CANNAREGIO\",\"line2\":\"3027\",\"postalCode\":\"30100\",\"town\":\"VENEZIA\"},\"geoPoint\":{\"latitude\":45.4480222,\"longitude\":12.3253576},\"name\":\"009099\",\"becommerce\":\"sap\",\"lsfCommerce\":\"cia\",\"distanceKm\":1.204956847135067,\"cartaConad\":false,\"cartaInsieme\":true,\"firstAvailableTimeSlot\":{\"available\":true,\"date\":1681948800000,\"endTime\":{\"timestamp\":1681992000000,\"formattedHour\":\"14:00\",\"hour\":14,\"minute\":0},\"extension\":30,\"reservationLength\":30,\"slotId\":\"OC_009099_20230420_082_9099\",\"startTime\":{\"timestamp\":1681974000000,\"formattedHour\":\"09:00\",\"hour\":9,\"minute\":0},\"serviceSurchargeThresholds\":[],\"isFull\":false},\"formattedDistance\":\"1.2 Km\",\"type\":\"PDV_SERVIZIO\",\"storeType\":\"Spesa Facile\",\"cooperativeId\":\"CIA\",\"logic\":\"SERVICE_LOGIC\",\"features\":{},\"hdTemporaryUnavailable\":false,\"ocTemporaryUnavailable\":false,\"enabled\":true,\"homeDeliveryEnabled\":false,\"orderAndCollectEnabled\":false,\"instorePaymentAccepted\":false,\"channelLogicHDEnabled\":false,\"channelLogicOCEnabled\":false,\"serviceLogicOCEnabled\":true,\"serviceLogicHDEnabled\":true,\"businessName\":\"INSIEME SNC DI TOMA ANDREA E C.\",\"substitutionModes\":[\"NO_SUBSTITUTION\",\"PUNCTUAL_SUBSTITUTION\"],\"maximumVolume\":24,\"maximumVolumeNoSurcharge\":24,\"maximumVolumeOC\":50,\"storeStatus\":\"ESISTENTE\",\"preparationNotesOtherComment\":false,\"newPlatform\":true,\"outdoorParking\":false,\"indoorParking\":false,\"storeSystems\":\"50204\",\"preparationCenters\":[\"009099\"],\"paymentMSTEnabled\":false,\"newPlatformSwitchDate\":\"2023-04-13T00:00:00.000Z\",\"paymentConadCardEnabled\":true,\"preparationNotesEnabled\":false,\"orderCollectRole\":\"CDP_AND_PR\",\"storeImages\":[],\"serviceHours\":[\"Dom - Sab 08:00 - 19:00\"],\"stampsEnabled\":false,\"pointsEnabled\":false,\"storeSize\":990,\"homeDeliveryRole\":\"CDP\",\"isBackupStore\":false}"');
        localStorage.setItem('selectedAddress', '"{\"address_components\":[{\"long_name\":\"Padova\",\"short_name\":\"Padova\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Padova\",\"short_name\":\"Padova\",\"types\":[\"administrative_area_level_3\",\"political\"]},{\"long_name\":\"Provincia di Padova\",\"short_name\":\"PD\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Veneto\",\"short_name\":\"Veneto\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"Italia\",\"short_name\":\"IT\",\"types\":[\"country\",\"political\"]}],\"formatted_address\":\"Padova PD, Italia\",\"geometry\":{\"bounds\":{\"south\":45.3555073,\"west\":11.809626,\"north\":45.4575002,\"east\":11.9728649},\"location\":{\"lat\":45.4064349,\"lng\":11.8767611},\"location_type\":\"APPROXIMATE\",\"viewport\":{\"south\":45.3555073,\"west\":11.809626,\"north\":45.4575002,\"east\":11.9728649}},\"place_id\":\"ChIJzzCrQVjafkcRLC4aqu02gsE\",\"types\":[\"locality\",\"political\"],\"notCompleted\":true}"');
        localStorage.setItem('typeOfServiceRedirectOldPdv', '"\\"ORDER_AND_COLLECT\\""');
      });
      // Wait for the required DOM to be rendered
      const pagedResults = await page.waitForSelector('div.product-results');
      const items = await pagedResults?.$$('div.card-middle');
      if(!items) throw new Error("Cannot find products :(");
      const objRes: Promise<ConadProductDesc[]> = Promise.all((items as ElementHandle<HTMLDivElement>[]).map(async (card: ElementHandle<HTMLDivElement>) => {
        const name = await (await card.$('a > div.product-description > h3'))?.evaluate(el => el.textContent);
        const price = await (await card.$('div.product-price'))?.evaluate(el => el.textContent);
        return <ConadProductDesc>{
          name,
          price: price?.match(/(\d{1,2},\d{1,2}€)/gm)?.pop() || '',
          desc: name
        }
      }));
      const availableItems = (await objRes).filter(item => item.price);
      purchasables = purchasables.concat(availableItems);
    }
    return purchasables;
  }
}

async function slotsFormatting(items: ConadProductDesc[]): Promise<ConadProductDesc[]> {
  console.log(items.map(item => item.desc).join(' , '));
  items = items.map(item => {
    const regexRes = item.desc?.match(/(\d) gelati|(\d) pezz/gmi)
    item.slots = regexRes ? parseInt(regexRes[0].replace(/gelati|pezz/i, '')) : undefined;
    return item;
  });
  return items;
}
