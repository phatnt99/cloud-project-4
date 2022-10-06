import { APIGatewayTokenAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJZbpZVire3LoLMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0ycWJ5ZXpiYy51cy5hdXRoMC5jb20wHhcNMjIwOTE4MTM0MzM3WhcN
MzYwNTI3MTM0MzM3WjAkMSIwIAYDVQQDExlkZXYtMnFieWV6YmMudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvAF2lFW+wLOeeqX2
WJTSlFqYK5yAuTZwOoDHw4lP1aW22P3U52ACgv2C5uNG4i9/qJKOEhSEsytSjjxy
TNniTt3Iv10oiEj91dBNRfW8PT3d+VJUlEXKTDeRX3WV0yk+WH0wPr9X2ve6YrVs
b7h+MdsrG87MadWMe2RPaD6KmGbk7Tc37DA5zk6TBdGdktFJ4FLkX4cTq851abw2
AVpL28vwTijKSeACIyRna0hV6kYLYjcrHPPO6976BBInDC8zJyM3E19bAnb/Z4hM
RBmxRfka9K2JtESikGZ6tgaDR4qntN9TbO6mwvz1cp9tcc0fr66AkUhA5TRcZOzy
4fcklwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSZo6WETMtR
SZm2hFEz0khMyOUrnjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACir/x4GJ4ccOgNXCON8gDeZa5DkeYnL3eBAlKLafoUDwPHaWh1Jipg1YXXeLsI7
iOAC1i28t0d1Oj7PQc7KLrotQU+oD8muEUtvUMBDeGafuXkLY5zx+y9CuF2tELDx
8SAq9Vnt5SLzOxmf/ooah8V2b4DMFMQkpi35uL8ankrsLfHGHvyGv5stkhdy9GUo
aNRnEXUbbsRn8Qv99BasPtNdxIcqv6dRH70DWkpcoX5DRq/5Mc8BaiPbQjwpfIPl
96Q3oGIDN5bso5USp1ZMzazRNAHj0tdkFH0YkThyVivBQ1a3fskgK/V5bSErrH6D
DgYn2Kit2hYWbpVwDCi9VRE=
-----END CERTIFICATE-----`

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  logger.info(authHeader)
  const bearerToken = authHeader.replace("Bearer ", "")

  return verify(bearerToken, cert, { algorithms: ['RS256'] }) as JwtPayload
}
