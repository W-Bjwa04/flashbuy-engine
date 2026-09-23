import { PRODUCT_METADATA_KEY_PREFIX, PRODUCT_METADATA_SUFFIX, PRODUCT_STOCK_KEY_PREFIX, STOCK_SUFFIX } from "../constants/constant";

export function generateProductStockRedisKey(productId: string): string {
    return `${PRODUCT_STOCK_KEY_PREFIX}${productId}${STOCK_SUFFIX}`;
}

export function generateProductMetadataRedisKey(productId: string): string {
    return `${PRODUCT_METADATA_KEY_PREFIX}${productId}${PRODUCT_METADATA_SUFFIX}`;
}