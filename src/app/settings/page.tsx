'use client';

import { Settings, Database, Key, Bell, Shield, Globe2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--color-fg-mute)] mb-1">
          §00 · Imprint
        </div>
        <h1 className="headline-md text-[28px] flex items-center gap-3">
          <Settings size={26} className="text-[var(--color-saffron)]" /> Settings
        </h1>
        <p className="text-[12px] text-[var(--color-fg-soft)] mt-2 max-w-2xl">
          Configure SAMIKSHA · CCMS integrations. Production deploys to the
          Karnataka State Data Centre on-prem; this UI surfaces the env vars
          the backend reads.
        </p>
      </div>

      {[
        {
          icon: <Database size={18} className="text-[var(--color-azure)]" />,
          title: 'Database — PostgreSQL (SAMIKSHA metadata)',
          desc: 'Our metadata store. CCMS\'s SQL Server is read-only via stored procedure.',
          fields: [
            { label: 'SAMIKSHA_DATABASE_URL', placeholder: 'postgresql://samiksha:***@db:5432/samiksha', type: 'text' },
            { label: 'CCMS_WRITEBACK_PROCEDURE', placeholder: 'dbo.sp_WriteVerifiedActionPlan', type: 'text' },
          ],
        },
        {
          icon: <Globe2 size={18} className="text-[var(--color-verdant)]" />,
          title: 'Source feed — Indian Kanoon (Karnataka HC)',
          desc: 'Live ingestion of Karnataka HC judgments via the public khckar docsource.',
          fields: [
            { label: 'INDIAN_KANOON_API_TOKEN', placeholder: 'token...', type: 'password' },
          ],
        },
        {
          icon: <Key size={18} className="text-[var(--color-saffron)]" />,
          title: 'LLM — prototype (Claude) / production (Llama 3.1 70B)',
          desc: 'SAMIKSHA SPEC §"Tech stack": Claude Sonnet 4.5 for hackathon, swappable to on-prem Llama for production.',
          fields: [
            { label: 'ANTHROPIC_API_KEY', placeholder: 'sk-ant-...', type: 'password' },
            { label: 'SAMIKSHA_LLM_MODEL', placeholder: 'claude-sonnet-4-5', type: 'text' },
          ],
        },
        {
          icon: <Bell size={18} className="text-[var(--color-verdant)]" />,
          title: 'Email Notifications — Resend',
          desc: 'Deadline alerts sent to assigned officers and department heads.',
          fields: [
            { label: 'RESEND_API_KEY', placeholder: 're_...', type: 'password' },
          ],
        },
        {
          icon: <Shield size={18} className="text-[var(--color-violet)]" />,
          title: 'Auth — CCMS SSO',
          desc: 'No new credentials — reviewer signing uses existing CCMS Single Sign-On per SPEC §"Non-negotiables".',
          fields: [
            { label: 'CCMS_SSO_ISSUER', placeholder: 'https://sso.karnataka.gov.in/', type: 'text' },
            { label: 'CCMS_SSO_AUDIENCE', placeholder: 'samiksha-ccms', type: 'text' },
          ],
        },
      ].map((section) => (
        <div key={section.title} className="card card-paper p-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            {section.icon}
            <h2 className="headline-md text-[16px]">{section.title}</h2>
          </div>
          <p className="text-[12px] text-[var(--color-fg-soft)] mb-5">{section.desc}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <Input
                key={f.label}
                label={f.label}
                type={f.type}
                placeholder={f.placeholder}
                mono
              />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="primary" size="md">
              Save changes
            </Button>
            <Button variant="ghost" size="md">
              Discard
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
