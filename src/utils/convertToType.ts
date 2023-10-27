// import { DATA_SOURCE, mongoClient, postgresClient } from "../db/clientPrisma"

// export const convertToType = (id:string) =>  {
//     if(DATA_SOURCE === 'postgres') {
//         return Number(id)
//     } else {
//         return id
//     }
// }
// export const getClient = () =>  {
//     if(DATA_SOURCE === 'postgres') {
//         return postgresClient
//     } else {
//         return mongoClient
//     }
// }