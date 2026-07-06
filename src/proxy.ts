import { NextResponse, type NextRequest } from "next/server";

const username = process.env.BASIC_AUTH_USER;
const password = process.env.BASIC_AUTH_PASSWORD;

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Legacy Gate"',
    },
  });
}

function readBasicCredentials(authorization: string) {
  try {
    const encodedCredentials = authorization.split(" ")[1];
    const decodedCredentials = atob(encodedCredentials);
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      providedUsername: decodedCredentials.slice(0, separatorIndex),
      providedPassword: decodedCredentials.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  if (!username || !password) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  const credentials = readBasicCredentials(authorization);

  if (
    credentials?.providedUsername !== username ||
    credentials.providedPassword !== password
  ) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
