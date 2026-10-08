'use client';

import React, { useEffect, useState } from 'react';

/* ─── Data Structures ─── */
type DevItem = {
  item: string;
  priceRM: number;
  priceUSD: number;
};

type ServerPlan = {
  id: string;
  name: string;
  recommended?: boolean;
  vCPU: string;
  ram: string;
  disk: string;
  bandwidth: string;
  location: string;
  priceRMYearly: number;
  priceUSDYearly: number;
};

type ServiceItem = {
  service: string;
  desc: string;
  priceRMYearly: number;
  priceUSDYearly: number;
};

const DEV_ITEMS: DevItem[] = [
  { item: 'Core LMS System & App Router Architecture', priceRM: 6000, priceUSD: 1400 },
  { item: 'Student & Mentor Portal UI/UX Design',       priceRM: 4000, priceUSD: 950 },
  { item: 'Database & DevOps Management',               priceRM: 2000, priceUSD: 480 },
  { item: 'Mail, OTP, Payment & Security Management',   priceRM: 3000, priceUSD: 700 },
];

const SERVER_PLANS: ServerPlan[] = [
  {
    id: 'vps1',
    name: 'Basic VPS 1',
    vCPU: '2 vCPU cores',
    ram: '8 GB RAM',
    disk: '100 GB NVMe disk space',
    bandwidth: '8 TB bandwidth',
    location: 'Cyberjaya, Malaysia',
    priceRMYearly: 1200,
    priceUSDYearly: 280,
  },
  {
    id: 'vps2',
    name: 'VPS 2',
    recommended: true,
    vCPU: '4 vCPU cores',
    ram: '16 GB RAM',
    disk: '200 GB NVMe disk space',
    bandwidth: '16 TB bandwidth',
    location: 'Cyberjaya, Malaysia',
    priceRMYearly: 2500,
    priceUSDYearly: 580,
  },
  {
    id: 'vps3',
    name: 'VPS 3 (High Capacity)',
    vCPU: '8 vCPU cores',
    ram: '32 GB RAM',
    disk: '500 GB NVMe disk space',
    bandwidth: '32 TB bandwidth',
    location: 'Cyberjaya, Malaysia',
    priceRMYearly: 4800,
    priceUSDYearly: 1120,
  },
];

const SERVICE_ITEMS: ServiceItem[] = [
  { service: 'Video CDN & HLS Streaming Storage', desc: 'High-speed global video streaming server & transcoding storage', priceRMYearly: 1200, priceUSDYearly: 280 },
  { service: 'Mail & OTP Transactional Gateway',  desc: 'High deliverability email OTPs, enrollment receipts & notifications', priceRMYearly: 600, priceUSDYearly: 140 },
  { service: 'Domain Name & SSL Certificate',     desc: 'Custom domain registration & wildcard SSL security certificate', priceRMYearly: 150, priceUSDYearly: 35 },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<'RM' | 'USD'>('RM');

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflowY = root.style.overflowY;
    const previousBodyOverflowY = document.body.style.overflowY;

    root.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';

    return () => {
      root.style.overflowY = previousOverflowY;
      document.body.style.overflowY = previousBodyOverflowY;
    };
  }, []);

  const totalDevCostRM = DEV_ITEMS.reduce((sum, i) => sum + i.priceRM, 0);
  const totalDevCostUSD = DEV_ITEMS.reduce((sum, i) => sum + i.priceUSD, 0);

  const formatPrice = (rm: number, usd: number) => {
    if (currency === 'RM') {
      return `RM ${rm.toLocaleString()}`;
    }
    return `\$${usd.toLocaleString()}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      padding: '48px 24px 96px',
      position: 'relative',
      overflowX: 'hidden',
      maxWidth: '100vw',
    }}>
      {/* Background accents */}
      <div style={{
        position: 'absolute', top: -100, left: -100, width: 400, height: 400,
        background: 'rgba(245, 158, 11, 0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: -100, width: 400, height: 400,
        background: 'rgba(217, 119, 6, 0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Currency & Navigation Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/presentation" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              ← Feature Presentation
            </a>
            <a href="/routes-presentation" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              Route Architecture Index
            </a>
          </div>

          {/* Currency Toggle */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: 3, borderRadius: 10, maxWidth: '100%' }}>
            <button
              onClick={() => setCurrency('RM')}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none',
                background: currency === 'RM' ? '#fff' : 'transparent',
                color: currency === 'RM' ? '#0f172a' : '#64748b',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                boxShadow: currency === 'RM' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              MYR (RM)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none',
                background: currency === 'USD' ? '#fff' : 'transparent',
                color: currency === 'USD' ? '#0f172a' : '#64748b',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                boxShadow: currency === 'USD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              USD (\$)
            </button>
          </div>
        </div>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b45309', marginBottom: 6 }}>
            FIN2U LMS PLATFORM
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Pricing Breakdown
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
            Development investment and yearly operating costs, in {currency === 'RM' ? 'Malaysian Ringgit (RM)' : 'US Dollars (USD)'}.
          </p>
        </div>

        {/* ── Card 1: System Development ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          padding: '32px 36px',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
            System Development
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ paddingBottom: 14, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', width: '70%' }}>
                  ITEM
                </th>
                <th style={{ paddingBottom: 14, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', textAlign: 'right' }}>
                  PRICE
                </th>
              </tr>
            </thead>
            <tbody>
              {DEV_ITEMS.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 0', fontSize: 14.5, fontWeight: 500, color: '#334155' }}>
                    {item.item}
                  </td>
                  <td style={{ padding: '16px 0', fontSize: 14.5, fontWeight: 800, color: '#0f172a', textAlign: 'right', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formatPrice(item.priceRM, item.priceUSD)}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr style={{ borderTop: '2px solid #f1f5f9' }}>
                <td style={{ paddingTop: 20, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  Total Development Cost
                </td>
                <td style={{ paddingTop: 20, fontSize: 18, fontWeight: 900, color: '#d97706', textAlign: 'right' }}>
                  {formatPrice(totalDevCostRM, totalDevCostUSD)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Card 2: Server Pricing ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          padding: '32px 36px',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Server Pricing
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
            Yearly VPS hosting in Cyberjaya, Malaysia.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, alignItems: 'stretch', width: '100%' }}>
            {SERVER_PLANS.map(plan => (
              <div
                key={plan.id}
                style={{
                  background: plan.recommended ? '#fff' : '#f8fafc',
                  border: plan.recommended ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: 24,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: plan.recommended ? '0 12px 24px -6px rgba(245, 158, 11, 0.15)' : 'none',
                }}
              >
                <div>
                  {plan.recommended && (
                    <div style={{
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: '#d97706', marginBottom: 12,
                    }}>
                      RECOMMENDED
                    </div>
                  )}

                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                    {plan.name}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#475569', marginBottom: 24 }}>
                    <div><strong style={{ color: '#0f172a' }}>{plan.vCPU.split(' ')[0]}</strong> {plan.vCPU.split(' ').slice(1).join(' ')}</div>
                    <div><strong style={{ color: '#0f172a' }}>{plan.ram.split(' ')[0]} {plan.ram.split(' ')[1]}</strong> {plan.ram.split(' ').slice(2).join(' ')}</div>
                    <div><strong style={{ color: '#0f172a' }}>{plan.disk.split(' ')[0]} {plan.disk.split(' ')[1]}</strong> {plan.disk.split(' ').slice(2).join(' ')}</div>
                    <div><strong style={{ color: '#0f172a' }}>{plan.bandwidth.split(' ')[0]} {plan.bandwidth.split(' ')[1]}</strong> {plan.bandwidth.split(' ').slice(2).join(' ')}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{plan.location}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {formatPrice(plan.priceRMYearly, plan.priceUSDYearly)}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>
                    / yearly
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 3: Operating Services & Maintenance ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          padding: '32px 36px',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Yearly Operating & Managed Services
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            Third-party cloud infrastructure and maintenance services.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ paddingBottom: 14, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', width: '70%' }}>
                  SERVICE
                </th>
                <th style={{ paddingBottom: 14, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', textAlign: 'right' }}>
                  PRICE / YEAR
                </th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_ITEMS.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>{item.service}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.desc}</div>
                  </td>
                  <td style={{ padding: '16px 0', fontSize: 14.5, fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                    {formatPrice(item.priceRMYearly, item.priceUSDYearly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 12 }}>
          © 2026 Fin2U LMS Platform. Confidential Business Proposal.
        </div>

      </div>
    </div>
  );
}
