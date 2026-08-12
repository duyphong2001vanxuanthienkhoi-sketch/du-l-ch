'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Bookmark, CalendarCheck, ChevronDown, ChevronUp, Lock, MapPin,
    Route, Stamp, Trash2, X,
} from 'lucide-react'
import TheDiaDiem from '@/components/TheDiaDiem'
import Anh from '@/components/Anh'
import AnhDiaDiem from '@/components/AnhDiaDiem'
import Loading from '@/components/Loading'
import TrangRong from '@/components/TrangRong'
import { useNgonNgu } from '@/lib/i18n'
import { iconDiaDiem, mauDiaDiem } from '@/lib/diaDiemLoai'
import { useDaLuu, useDiaDiem } from '@/lib/utils/diaDiemClient'
import { useCheckIn, tinhHuyHieu, thongKe, xoaDau } from '@/lib/utils/hoChieu'
import {
    useLichTrinh, boKhoiLichTrinh, doiChoLichTrinh, suaMuc, xoaHetLichTrinh,
} from '@/lib/utils/lichTrinh'

// HÀNH TRÌNH CỦA TÔI — ba tab: Đã lưu · Lịch trình · Hộ chiếu.
// TẤT CẢ chạy trên localStorage, KHÔNG cần đăng nhập (guest-first, mục 7).
// Đây là phần "lý do quay lại" của app: chỗ đã lưu, kế hoạch đang dựng, và dấu đã đóng.

export default function TrangHanhTrinh() {
    const { t } = useNgonNgu()
    const { ds, dangTai } = useDiaDiem()
    const [daLuu] = useDaLuu()
    const lichTrinh = useLichTrinh()
    const checkIns = useCheckIn()
    const [tab, setTab] = useState('da-luu')

    const theoId = useMemo(() => Object.fromEntries(ds.map(d => [d.id, d])), [ds])
    const huyHieu = useMemo(() => tinhHuyHieu(checkIns, ds), [checkIns, ds])
    const tk = useMemo(() => thongKe(checkIns, ds), [checkIns, ds])

    if (dangTai) return <Loading />

    const dsLuu = daLuu.map(id => theoId[id]).filter(Boolean)
    const daDat = huyHieu.filter(h => h.daDat)

    const tabs = [
        { id: 'da-luu', nhan: t('Đã lưu', 'Saved', '收藏'), Icon: Bookmark, so: dsLuu.length, mau: '#e11d48' },
        { id: 'lich-trinh', nhan: t('Lịch trình', 'My plan', '我的行程'), Icon: Route, so: lichTrinh.length, mau: '#B8923F' },
        { id: 'ho-chieu', nhan: t('Hộ chiếu', 'Passport', '护照'), Icon: Stamp, so: tk.tong, mau: '#00A8A8' },
    ]

    return (
        <div className='min-h-[70vh] mb-28 max-w-5xl mx-auto px-5 pt-6'>
            <h1 className='text-3xl chu-hien-thi text-slate-800'>{t('Hành trình của tôi', 'My journey', '我的旅程')}</h1>
            <p className='text-slate-500 mt-1.5 text-sm'>
                {t('Tất cả lưu ngay trên máy bạn — không cần tài khoản.',
                    'Everything is stored on your device — no account needed.',
                    '全部保存在你的设备上 —— 无需账户。')}
            </p>

            {/* Tab */}
            <div className='flex gap-2 mt-5 overflow-x-auto no-scrollbar cuon-chip'>
                {tabs.map(x => (
                    <button key={x.id} onClick={() => setTab(x.id)} aria-pressed={tab === x.id}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition shrink-0 ${tab === x.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                        style={tab === x.id ? { backgroundColor: x.mau } : undefined}>
                        <x.Icon size={15} /> {x.nhan}
                        <span className={tab === x.id ? 'text-white/70' : 'text-slate-400'}>{x.so}</span>
                    </button>
                ))}
            </div>

            {/* ---------- ĐÃ LƯU ---------- */}
            {tab === 'da-luu' && (
                dsLuu.length ? (
                    <div className='luoi-dd grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6'>
                        {dsLuu.map(d => <TheDiaDiem key={d.id} d={d} />)}
                    </div>
                ) : (
                    <TrangRong Icon={Bookmark} mau='#e11d48'
                        tieuDe={t('Chưa lưu địa điểm nào', 'Nothing saved yet', '还没有收藏')}
                        moTa={t('Bấm dấu trang trên thẻ địa điểm để lưu — không cần đăng nhập.',
                            'Tap the bookmark on any place card — no account needed.',
                            '点击地点卡片上的书签即可收藏 —— 无需登录。')}
                        nutText={t('Khám phá Hồng Gai', 'Explore Hong Gai', '探索鸿基')} nutHref='/kham-pha' />
                )
            )}

            {/* ---------- LỊCH TRÌNH ---------- */}
            {tab === 'lich-trinh' && (
                lichTrinh.length ? (
                    <>
                        <div className='flex items-center justify-between gap-3 mt-6 mb-3 flex-wrap'>
                            <p className='text-sm text-slate-500'>
                                {t('Dùng mũi tên để đổi thứ tự các điểm.', 'Use the arrows to reorder stops.', '用箭头调整顺序。')}
                            </p>
                            <button onClick={() => confirm(t('Xoá toàn bộ lịch trình?', 'Clear the whole plan?', '清空整个行程？')) && xoaHetLichTrinh()}
                                className='text-xs text-slate-400 hover:text-red-600 underline'>
                                {t('Xoá hết', 'Clear all', '清空')}
                            </button>
                        </div>

                        <div className='flex flex-col gap-2.5'>
                            {lichTrinh.map((m, i) => {
                                const d = theoId[m.diaDiemId]
                                if (!d) return null
                                const mau = mauDiaDiem(d)
                                return (
                                    <div key={m.diaDiemId} className='flex gap-3 items-start bg-white border border-slate-100 rounded-2xl p-3 shadow-sm'>
                                        <div className='flex flex-col items-center gap-0.5 shrink-0'>
                                            <button onClick={() => doiChoLichTrinh(i, -1)} disabled={i === 0}
                                                aria-label={t('Lên', 'Up', '上移')}
                                                className='text-slate-300 hover:text-slate-600 disabled:opacity-30'>
                                                <ChevronUp size={18} />
                                            </button>
                                            <span className='flex items-center justify-center size-7 rounded-full text-white text-xs font-bold'
                                                style={{ backgroundColor: mau }}>{i + 1}</span>
                                            <button onClick={() => doiChoLichTrinh(i, 1)} disabled={i === lichTrinh.length - 1}
                                                aria-label={t('Xuống', 'Down', '下移')}
                                                className='text-slate-300 hover:text-slate-600 disabled:opacity-30'>
                                                <ChevronDown size={18} />
                                            </button>
                                        </div>

                                        <Link href={`/dia-diem/${d.id}`} className='shrink-0'>
                                            {d.anhBia
                                                ? <Anh src={d.anhBia} alt='' className='size-16 rounded-xl object-cover' />
                                                : <span className='block size-16 rounded-xl overflow-hidden'>
                                                    <AnhDiaDiem id={d.id} alt='' className='w-full h-full object-cover'
                                                        fallback={<span className='flex items-center justify-center w-full h-full text-2xl'
                                                            style={{ background: `linear-gradient(135deg, ${mau}22, ${mau}55)` }}>{iconDiaDiem(d)}</span>} />
                                                </span>}
                                        </Link>

                                        <div className='min-w-0 flex-1'>
                                            <Link href={`/dia-diem/${d.id}`} className='font-bold text-slate-800 hover:underline'>
                                                {t(...d.ten)}
                                            </Link>
                                            <input value={m.ghiChu || ''} onChange={e => suaMuc(i, { ghiChu: e.target.value })}
                                                placeholder={t('Ghi chú của bạn…', 'Your note…', '你的备注…')}
                                                className='w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:border-slate-300' />
                                        </div>

                                        <button onClick={() => boKhoiLichTrinh(m.diaDiemId)}
                                            aria-label={t('Bỏ khỏi lịch trình', 'Remove', '移除')}
                                            className='p-1.5 text-slate-300 hover:text-red-600 shrink-0'>
                                            <X size={16} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <TrangRong Icon={Route} mau='#B8923F'
                        tieuDe={t('Lịch trình còn trống', 'Your plan is empty', '行程还是空的')}
                        moTa={t('Mở một địa điểm rồi bấm "Thêm vào lịch trình", hoặc lấy nguyên một lộ trình dựng sẵn.',
                            'Open a place and tap "Add to plan", or start from a ready-made itinerary.',
                            '打开地点点击"加入行程"，或直接采用现成行程。')}
                        nutText={t('Xem lộ trình gợi ý', 'Browse itineraries', '查看推荐行程')} nutHref='/lo-trinh' />
                )
            )}

            {/* ---------- HỘ CHIẾU ---------- */}
            {tab === 'ho-chieu' && (
                <div className='mt-6'>
                    {/* Tổng quan */}
                    <div className='rounded-3xl p-6 text-white'
                        style={{ background: 'linear-gradient(135deg,#14486E,#08243C)' }}>
                        <p className='text-sm text-white/70'>{t('Hộ chiếu Hồng Gai', 'Hong Gai passport', '鸿基护照')}</p>
                        <div className='flex items-end gap-6 mt-2 flex-wrap'>
                            <div>
                                <p className='text-4xl font-bold'>{tk.tong}</p>
                                <p className='text-xs text-white/70'>{t('dấu đã đóng', 'stamps', '已盖章')}</p>
                            </div>
                            <div>
                                <p className='text-4xl font-bold'>{daDat.length}</p>
                                <p className='text-xs text-white/70'>{t('huy hiệu', 'badges', '徽章')}</p>
                            </div>
                            <div>
                                <p className='text-4xl font-bold'>{tk.soLoai}</p>
                                <p className='text-xs text-white/70'>{t('loại hình', 'categories', '类型')}</p>
                            </div>
                        </div>
                        <p className='text-xs text-white/60 mt-4'>
                            {t('Đóng dấu bằng cách tới tận nơi và bấm "Đóng dấu" ở trang địa điểm — máy kiểm tra vị trí thật.',
                                'Stamp by going there and tapping "Check in" on the place page — your location is verified.',
                                '亲临现场并在地点页点击"打卡" —— 系统会核验你的位置。')}
                        </p>
                    </div>

                    {/* Huy hiệu */}
                    <h2 className='font-semibold text-slate-700 mt-8 mb-3'>{t('Huy hiệu', 'Badges', '徽章')}</h2>
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                        {huyHieu.map(h => (
                            <div key={h.id}
                                className={`rounded-2xl p-4 border transition ${h.daDat ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                                <div className='flex items-start justify-between'>
                                    <span className={`text-3xl ${h.daDat ? '' : 'grayscale opacity-40'}`}>{h.icon}</span>
                                    {!h.daDat && <Lock size={13} className='text-slate-300 mt-1' />}
                                </div>
                                <p className={`font-bold text-sm mt-2 ${h.daDat ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {t(...h.ten)}
                                </p>
                                <p className='text-[11px] text-slate-400 mt-0.5 leading-snug'>{t(...h.moTa)}</p>
                                {!h.daDat && (
                                    <div className='mt-2'>
                                        <div className='h-1.5 rounded-full bg-slate-200 overflow-hidden'>
                                            <div className='h-full rounded-full transition-all'
                                                style={{ width: `${(h.tienDo / h.can) * 100}%`, backgroundColor: h.mau }} />
                                        </div>
                                        <p className='text-[10px] text-slate-400 mt-1'>{h.tienDo}/{h.can}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Dấu đã đóng */}
                    <h2 className='font-semibold text-slate-700 mt-8 mb-3'>
                        {t('Dấu đã đóng', 'Stamps collected', '已收集的印章')} ({tk.tong})
                    </h2>
                    {tk.tong ? (
                        <div className='flex flex-col gap-2'>
                            {checkIns.map(c => {
                                const d = theoId[c.diaDiemId]
                                if (!d) return null
                                const mau = mauDiaDiem(d)
                                return (
                                    <div key={c.diaDiemId} className='flex items-center gap-3.5 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm'>
                                        <span className='flex items-center justify-center size-11 rounded-xl shrink-0 text-2xl'
                                            style={{ backgroundColor: mau + '1a' }}>{iconDiaDiem(d)}</span>
                                        <div className='min-w-0 flex-1'>
                                            <Link href={`/dia-diem/${d.id}`} className='font-semibold text-slate-800 hover:underline'>
                                                {t(...d.ten)}
                                            </Link>
                                            <p className='text-xs text-slate-400 mt-0.5'>
                                                {new Date(c.luc).toLocaleString('vi-VN', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <button onClick={() => confirm(t('Xoá dấu này?', 'Remove this stamp?', '删除此印章？')) && xoaDau(c.diaDiemId)}
                                            aria-label={t('Xoá dấu', 'Remove stamp', '删除印章')}
                                            className='p-2 text-slate-300 hover:text-red-600 shrink-0'>
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <TrangRong Icon={CalendarCheck} mau='#00A8A8'
                            tieuDe={t('Chưa có dấu nào', 'No stamps yet', '还没有印章')}
                            moTa={t('Tới một địa điểm bất kỳ ở Hồng Gai rồi mở trang của nó để đóng dấu đầu tiên.',
                                'Visit any place in Hong Gai and open its page to collect your first stamp.',
                                '前往鸿基任一地点，打开其页面即可获得第一枚印章。')}
                            nutText={t('Xem bản đồ', 'Open the map', '打开地图')} nutHref='/ban-do' />
                    )}
                </div>
            )}
        </div>
    )
}
