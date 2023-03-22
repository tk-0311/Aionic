export interface ApiKey {
  _id?: any,
  api_key: string,
  url: string,
  __v?: number
}
export interface App {
  _id?: any,
  name: string,
  uid: string,
  source: {
    repoURL: string,
    path:string,
    targetRevision: string
  },
  date?: Date,
  head?: string,
  tail?: string,
  __v?: number
}
export interface Node {
  _id?: any
  manifest: string,
  revision: string,
  sourceType:string,
  prev?: string,
  next?: string
}
export type error = {
  message: string,
  status: number,
  log: string
}