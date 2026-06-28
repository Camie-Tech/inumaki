import { NextRequest, NextResponse } from 'next/server';

function disabled() {
  return NextResponse.json({ error: 'Admin is not available in OSS mode' }, { status: 404 });
}

export async function GET() {
  return disabled();
}

export async function POST(_req: NextRequest) {
  return disabled();
}

export async function PATCH(_req: NextRequest) {
  return disabled();
}
