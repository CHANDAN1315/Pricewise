"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productUrl){
    if(!productUrl) return;

    try{
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
        
    }
    catch{
        throw new Error(`Failed to scrap product ${error.message}`);
    }
}