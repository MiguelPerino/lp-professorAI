export default function retiredServer(_request, response) {
  response
    .status(410)
    .setHeader('cache-control', 'no-store')
    .json({
      error: 'BFF_RETIRED',
      message: 'A LP usa diretamente o backend AçõesJá. Este serviço foi descontinuado.',
    })
}
