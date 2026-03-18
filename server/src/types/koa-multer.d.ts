declare module '@koa/multer' {
  import { Middleware, Context, Next } from 'koa'
  
  interface File {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    destination: string
    filename: string
    path: string
    buffer: Buffer
  }
  
  interface Options {
    dest?: string
    storage?: any
    fileFilter?: (req: any, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void
    limits?: {
      fieldNameSize?: number
      fieldSize?: number
      fields?: number
      fileSize?: number
      files?: number
      parts?: number
      headerPairs?: number
    }
  }
  
  function koaMulter(options?: Options): {
    single(field: string): Middleware
    array(field: string, maxCount?: number): Middleware
    fields(fields: readonly { name: string; maxCount?: number }[]): Middleware
    none(): Middleware
    any(): Middleware
  }
  
  export default koaMulter
  
  export function diskStorage(options: {
    destination: (req: any, file: File, callback: (error: Error | null, destination: string) => void) => void
    filename: (req: any, file: File, callback: (error: Error | null, filename: string) => void) => void
  }): any
}