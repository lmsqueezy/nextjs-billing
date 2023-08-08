
export class LemonSqueezy {

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async queryApi({
    path,
    method = 'GET',
    params,
    payload
  }) {

    const apiUrl = 'https://api.lemonsqueezy.com'

    try {

      // Prepare URL
      const url = new URL(path, apiUrl);
      if (params && method === "GET") {
        Object.entries(params).forEach(([key, value]) =>
          url.searchParams.append(key, value)
        );
      }

      const options = {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/vnd.api+json"
        },
        method
      }
      if (payload) {
        options['body'] = JSON.stringify(payload)
      }

      console.log(url.href)
      console.log(options)

      const response = await fetch(url.href, options);

      if (!response.ok) {
        console.log(await response.json())
        throw {
          status: response.status,
          message: response.statusText,
          // errors: errorsJson.errors,
        };
      }

      const json = await response.json();

      return json;
    } catch (error) {
      throw error;
    }
  }

  async getProducts(params) {
    return this.queryApi({ path: 'v1/products', params });
  }

  async getVariants(params) {
    return this.queryApi({ path: 'v1/variants', params });
  }

  async createCheckout(storeId, variantId, attributes) {
    let payload = {
        'data': {
            'type': 'checkouts',
            'attributes': attributes,
            'relationships': {
                'store': {
                    'data': {
                        'type': 'stores',
                        'id': '' + storeId // convert to string
                    }
                },
                'variant': {
                    'data': {
                        'type': 'variants',
                        'id': '' + variantId // convert to string
                    }
                }
            }
        }
    }
    console.log(payload)
    return this.queryApi({ path: 'v1/checkouts', method: 'POST', payload });
  }

}