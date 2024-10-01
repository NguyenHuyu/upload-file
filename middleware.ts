import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	if (!request.nextUrl.pathname.startsWith('/api/files') ) {
	  return Response.json(
		{ message: 'Page not found' },
		{ status: 401 }
	  )
	}
  }