interface config {
  global: {url:string, api_key: string}
  mongodb_uri: string
}
export const config:config = {global: {
  url:process.env.url,
  api_key: process.env.api_key
  },
  mongodb_uri: process.env.mongodb_uri
}