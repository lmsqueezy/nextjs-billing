import prisma from "@/lib/prisma";
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


async function getPlans() {
  // Fetch data from Lemon Squeezy

  const params = {include: 'product', 'perPage': 50}

  var hasNextPage = true
  var page = 1

  var variants = []
  var products = []

  while (hasNextPage) {
    const resp = await ls.getVariants(params);
    
    variants = variants.concat(resp['data'])
    products = products.concat(resp['included'])

    if (resp['meta']['page']['lastPage'] > page) {
      page += 1
      params['page'] = page
    } else {
      hasNextPage = false
    }
  }

  // Nest products inside variants
  let prods = {}
  for (var i = 0; i < products.length; i++) {
    prods[products[i]['id']] = products[i]['attributes']
  }
  for (var i = 0; i < variants.length; i++) {
    variants[i]['product'] = prods[variants[i]['attributes']['product_id']]
  }


  // Save locally
  var variantId,
      variant,
      product,
      productId

  for (var i = 0; i < variants.length; i++) {

    variant = variants[i]

    if ( !variant['attributes']['is_subscription'] ) {
      console.log('Not a subscription')
      continue
    }

    if ( parseInt(variant['product']['store_id']) != process.env.LEMONSQUEEZY_STORE_ID ) {
      console.log(`Store ID ${variant['product']['store_id']} does not match (${process.env.LEMONSQUEEZY_STORE_ID})`)
      continue
    }

    variantId = parseInt(variant['id'])
    product = variant['product']
    productId = parseInt(variant['attributes']['product_id'])

    variant = variant['attributes']

    try {
      console.log('Adding/updating variant ' + variantId)
      await prisma.plan.upsert({
        where: {
          variantId: variantId
        },
        update: {
          productId: productId,
          name: product['name'],
          variantName: variant['name'],
          status: variant['status'],
          sort: variant['sort'],
          description: variant['description'],
          price: variant['price'],
          interval: variant['interval'],
          intervalCount: variant['interval_count'],
        },
        create: {
          variantId: variantId,
          productId: productId,
          name: product['name'],
          variantName: variant['name'],
          status: variant['status'],
          sort: variant['sort'],
          description: variant['description'],
          price: variant['price'],
          interval: variant['interval'],
          intervalCount: variant['interval_count'],
        }
      })
    } catch (error) {
      console.log(variant)
      console.log(error)
    }
  }
}

export default async function Page() {
  const plans = await getPlans()
  
  return (
    <>
      Done!
    </>
  )
}

