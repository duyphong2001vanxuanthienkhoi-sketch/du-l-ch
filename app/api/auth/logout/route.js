import { NextResponse } from 'next/server'
import { xoaPhien } from '@/lib/server/phien'

export async function POST() {
    await xoaPhien()
    return NextResponse.json({ ok: true })
}
