"use server"

import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency,  extractDescription,  extractPrice } from "../utils";

export async function scrapeAmazonProduct(url) {
    if (!url) return;

    // Bright data proxy configuration.
    const username = process.env.BRIGHT_DATA_USERNAME;
    const password = process.env.BRIGHT_DATA_PASSWORD;
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const option = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,

    }

    try {
        const response = await axios.get(url, option);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base')
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() == 'currently unavailable';

        const images =  $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') || '{}';

        const imageUrls = Object.keys(JSON.parse(images));
        
        const currency = extractCurrency($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
        
        const description = extractDescription($);
        
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice : currentPrice || originalPrice,
            originalPrice: originalPrice || currentPrice,
            priceHistory: [],
            discountRate: discountRate,
            category: 'category',
            reviewCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice : currentPrice || originalPrice,
            higestPrice : originalPrice || currentPrice,
            averagePrice : currentPrice || originalPrice 


        }
        return data;
        // console.log(data)
        // console.log({url,title, currentPrice, originalPrice, imageUrls, currency});
    } catch (error) {
        throw new Error(`Failed to scrap product ${error.message}`);
    }
}