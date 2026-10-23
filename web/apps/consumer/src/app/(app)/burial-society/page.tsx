"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { burialSocieties as societiesApi, type BurialSocietyDto, type MyContributionsResult } from "@/lib/api";
import { getToken, getHouseholdId } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BurialSocietyPage() {
  const householdId = getHouseholdId();

  const [society, setSociety] = useState<BurialSocietyDto | null>(null);
  const [myContributions, setMyContributions] = useState<MyContributionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", monthlyContributionAmount: "", registrationNumber: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Add member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ memberHouseholdId: "", fullName: "", mobileNumber: "" });
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Record contribution
  const [contributingMemberId, setContributingMemberId] = useState<string | null>(null);
  const [contributionNote, setContributionNote] = useState("");
  const [recordingContribution, setRecordingContribution] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    societiesApi.getMy(token)
      .then((s) => {
        setSociety(s);
        // Load member's own contribution history
        return societiesApi.getMyContributions(token, s.id).then(setMyContributions).catch(() => null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  const period = currentPeriod();
  const isAdmin = society?.adminHouseholdId === householdId;

  async function createSociety(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setCreateError("");
    try {
      const s = await societiesApi.create(token, {
        name: createForm.name,
        monthlyContributionAmount: parseFloat(createForm.monthlyContributionAmount),
        registrationNumber: createForm.registrationNumber || undefined,
      });
      setSociety(s);
      setShowCreate(false);
      setNotFound(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create society");
    } finally {
      setCreating(false);
    }
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!society) return;
    const token = getToken();
    if (!token) return;
    setAddingMember(true);
    setMemberError("");
    try {
      const s = await societiesApi.addMember(token, society.id, memberForm);
      setSociety(s);
      setShowAddMember(false);
      setMemberForm({ memberHouseholdId: "", fullName: "", mobileNumber: "" });
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  }

  async function recordContribution(memberId: string) {
    if (!society) return;
    const token = getToken();
    if (!token) return;
    setRecordingContribution(true);
    try {
      const s = await societiesApi.recordContribution(token, society.id, {
        memberId,
        amountPaid: society.monthlyContributionAmount,
        period,
        note: contributionNote || undefined,
      });
      setSociety(s);
      setContributingMemberId(null);
      setContributionNote("");
    } finally {
      setRecordingContribution(false);
    }
  }

  function hasPaidThisPeriod(memberId: string) {
    return society?.recentContributions.some(
      (c) => c.memberId === memberId && c.period === period
    ) ?? false;
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-dusk-ink h-32 animate-pulse" />
        <div className="px-4 py-4 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-dusk-ink/6 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AppHeader title={society ? society.name : "Burial Society"} />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text variant="heading_small" color="light" className="font-serif text-base font-semibold text-warm-paper">Burial Society</Text>
          <Text variant="body_small" color="light" superFaded >Manage your burial society, track contributions, and keep your membership details up to date.</Text>
        </div>

        {/* No society yet */}
        {(notFound || !society) && !showCreate && (
          <div className="flex flex-col items-center py-12 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/30">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <Text variant="heading_small" className=" mb-2">No burial society yet</Text>
              <Text faded className=" max-w-xs">
                Create a society to manage group contributions and track member payments together.
              </Text>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
            >
              Create a society
            </Button>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <form onSubmit={createSociety} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
            <Text >New burial society</Text>
            {[
              { label: "Society name", field: "name", placeholder: "e.g. Dlamini Family Society", type: "text" },
              { label: "Monthly contribution (R)", field: "monthlyContributionAmount", placeholder: "e.g. 150", type: "number" },
              { label: "Registration number (optional)", field: "registrationNumber", placeholder: "e.g. CIPC ref", type: "text" },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field} className="space-y-1">

                <Input
                  label={label}
                  type={type}
                  value={createForm[field as keyof typeof createForm]}
                  onChange={(e) => setCreateForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  required={field !== "registrationNumber"}
                  className="w-full "
                />
              </div>
            ))}
            {createError && <Text variant="body_small" className="text-ember">{createError}</Text>}
            <div className="flex gap-2">
              <Button variant="outline_dark" type="button" onClick={() => setShowCreate(false)}
                className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={creating}
              >
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        )}

        {society && (
          <>
            {/* Period summary */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Text variant="body_small" superFaded className="uppercase tracking-wider">
                  {period}
                </Text>
                <Text as="span" variant="body_small_sec">
                  {society.recentContributions.filter((c) => c.period === period).length} / {society.members.length} paid
                </Text>
              </div>
              <div className="h-2 rounded-full bg-dusk-ink/8 overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all"
                  style={{
                    width: society.members.length > 0
                      ? `${(society.recentContributions.filter((c) => c.period === period).length / society.members.length) * 100}%`
                      : "0%"
                  }}
                />
              </div>
              <Text variant="body_sec">
                R{society.recentContributions
                  .filter((c) => c.period === period)
                  .reduce((s, c) => s + c.amountPaid, 0)
                  .toLocaleString()} collected
              </Text>
            </div>

            {/* Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Text variant="body_small" className="uppercase tracking-wider">Members</Text>
                {isAdmin && (
                  <Button
                    variant="sec"
                    onClick={() => setShowAddMember(true)}
                  >
                    + Add
                  </Button>
                )}
              </div>

              {society.members.map((m) => {
                const paid = hasPaidThisPeriod(m.id);
                const isContributing = contributingMemberId === m.id;
                const canRecord = isAdmin || m.householdId === householdId;
                return (
                  <div key={m.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text >{m.fullName}</Text>
                        <Text superFaded variant="body_small">{m.mobileNumber}</Text>
                      </div>
                      {paid ? (
                        <span className="rounded-full bg-sage/10 px-2.5 py-0.5 font-sans text-xs font-medium text-sage">Paid</span>
                      ) : (
                        <span className="rounded-full bg-candlewick/10 px-2.5 py-0.5 font-sans text-xs font-medium text-candlewick">Unpaid</span>
                      )}
                    </div>
                    {!paid && canRecord && !isContributing && (
                      <Button
                        variant="sec"
                        onClick={() => setContributingMemberId(m.id)}
                        className="w-full "
                      >
                        Record R{society.monthlyContributionAmount.toLocaleString()} payment
                      </Button>
                    )}
                    {!paid && canRecord && isContributing && (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          value={contributionNote}
                          onChange={(e) => setContributionNote(e.target.value)}
                          placeholder="Note (e.g. cash ref, EFT ref) — optional"
                          className="w-full "
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline_dark"
                            onClick={() => setContributingMemberId(null)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => recordContribution(m.id)}
                            disabled={recordingContribution}
                            className="flex-1 rounded-xl bg-sage py-2 font-sans text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {recordingContribution ? "Recording…" : "Confirm paid"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {showAddMember && (
                <form onSubmit={addMember} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                  <Text >Add member</Text>
                  {[
                    { label: "Full name", field: "fullName", placeholder: "Member's full name", type: "text" },
                    { label: "Mobile number", field: "mobileNumber", placeholder: "e.g. 082 123 4567", type: "tel" },
                    { label: "Household ID", field: "memberHouseholdId", placeholder: "Their household ID (UUID)", type: "text" },
                  ].map(({ label, field, placeholder, type }) => (
                    <div key={field} className="space-y-1">
                      <Input
                        label={label}
                        type={type}
                        required
                        value={memberForm[field as keyof typeof memberForm]}
                        onChange={(e) => setMemberForm((f) => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-2.5 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                      />
                    </div>
                  ))}
                  {memberError && <Text variant="body_small" className="text-ember">{memberError}</Text>}
                  <div className="flex gap-2">
                    <Button variant="sec" type="button" onClick={() => setShowAddMember(false)}
                      className="flex-1 ">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addingMember}
                      className="flex-1">
                      {addingMember ? "Adding…" : "Add member"}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Recent contributions (admin view) */}
            {isAdmin && society.recentContributions.length > 0 && (
              <div className="space-y-2">
                <Text variant="body_small" superFaded className="uppercase tracking-wider ">
                  Recent payments
                </Text>
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                  {society.recentContributions.slice(0, 10).map((c, i) => {
                    const member = society.members.find((m) => m.id === c.memberId);
                    return (
                      <div key={c.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-dusk-ink/6" : ""}`}>
                        <div>
                          <Text >{member?.fullName ?? "Unknown"}</Text>
                          <Text variant="body_small_sec" superFaded>{c.period}</Text>
                        </div>
                        <Text variant="body_sec" className=" text-sage">R{c.amountPaid.toLocaleString()}</Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* My contribution history (member view) */}
            {myContributions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Text variant="body_small" superFaded className="uppercase tracking-wider">
                    My payment history
                  </Text>
                  <Text as="span" variant="body_small_sec" superFaded >
                    {myContributions.contributions.length} payment{myContributions.contributions.length !== 1 ? "s" : ""}
                  </Text>
                </div>
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                  {myContributions.contributions.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Text className="font-sans text-sm text-dusk-ink/40">No payments recorded yet.</Text>
                    </div>
                  ) : (
                    <div className="divide-y divide-dusk-ink/5">
                      {myContributions.contributions.map((c) => (
                        <div key={c.period} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <Text variant="body_sec" >{c.period}</Text>
                            {c.note && <Text variant="body_small" superFaded className="mt-0.5">{c.note}</Text>}
                          </div>
                          <div className="text-right">
                            <Text variant="body_sec" className="text-sage">R{c.amountPaid.toLocaleString()}</Text>
                            <Text variant="body_small" superFaded >
                              {new Date(c.recordedAt).toLocaleDateString("en-ZA")}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
