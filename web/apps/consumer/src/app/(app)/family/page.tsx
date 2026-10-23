"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { emergency as emergencyApi, households as householdsApi, type EmergencySessionDto, type MemberDto } from "@/lib/api";
import { getToken, getHouseholdId } from "@/lib/auth";
import { Input, Text, Button } from "@/partials";

export default function FamilyPage() {
  const [session, setSession] = useState<EmergencySessionDto | null>(null);
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newContact, setNewContact] = useState({ fullName: "", mobileNumber: "", relationship: "" });
  const [newMember, setNewMember] = useState({ fullName: "", mobileNumber: "" });
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [requestingGrantId, setRequestingGrantId] = useState<string | null>(null);
  const [revokingGrantId, setRevokingGrantId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    Promise.all([
      householdsApi.getMembers(token, householdId).catch(() => [] as typeof members),
      emergencyApi.getSession(token).catch(() => null),
    ]).then(([m, s]) => {
      setMembers(m);
      setSession(s);
    });
  }, []);

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    const householdId = getHouseholdId();
    if (!token || !householdId) return;
    setInviting(true);
    setInviteError("");
    try {
      await householdsApi.addMember(token, householdId, newMember.mobileNumber, newMember.fullName);
      const updated = await householdsApi.getMembers(token, householdId);
      setMembers(updated);
      setShowInviteForm(false);
      setNewMember({ fullName: "", mobileNumber: "" });
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setInviting(false);
    }
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const existing = session?.contacts ?? [];
      const updated = await emergencyApi.upsertContacts(token, [
        ...existing.map((c) => ({ fullName: c.fullName, mobileNumber: c.mobileNumber, relationship: c.relationship })),
        newContact,
      ]);
      setSession(updated);
      setShowAddForm(false);
      setNewContact({ fullName: "", mobileNumber: "", relationship: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSaving(false);
    }
  }

  async function requestGrant(contactId: string) {
    const token = getToken();
    if (!token) return;
    setRequestingGrantId(contactId);
    try {
      const grant = await emergencyApi.requestGrant(token, contactId);
      setSession((s) => s ? { ...s, activeGrants: [...s.activeGrants, grant] } : s);
    } finally {
      setRequestingGrantId(null);
    }
  }

  async function revokeGrant(grantId: string) {
    const token = getToken();
    if (!token) return;
    setRevokingGrantId(grantId);
    try {
      await emergencyApi.revokeGrant(token, grantId);
      setSession((s) => s ? { ...s, activeGrants: s.activeGrants.filter((g) => g.id !== grantId) } : s);
    } finally {
      setRevokingGrantId(null);
    }
  }

  return (
    <div className="w-full">
      <AppHeader title="Family & Contacts" />

      <div className="px-6 py-6 space-y-6">
        <div className="rounded-2xl bg-dusk-ink px-4 py-4 space-y-1">
          <Text color="light" >Family & Contacts</Text>
          <Text color="light" variant="body_small" faded className="leading-relaxed">Manage household members and trusted emergency contacts who can access your vault.</Text>
        </div>

        {/* Household members section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Text variant="body_small" superFaded className="uppercase tracking-wider">
              Household members
            </Text>
            <Button
              variant="outline_dark"
              onClick={() => setShowInviteForm(true)}
            >
              + Invite
            </Button>
          </div>

          {members.length === 0 && !showInviteForm && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 text-center">
              <Text superFaded variant="body_small" >Only you so far. Invite family members to share the vault.</Text>
            </div>
          )}

          {members.map((m) => (
            <div key={m.userId} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dusk-ink/8 flex items-center justify-center flex-shrink-0">
                <Text as="span" >{m.fullName.charAt(0).toUpperCase()}</Text>
              </div>
              <div className="flex-1 min-w-0">
                <Text className="truncate">{m.fullName}</Text>
                <Text variant="body_small" superFaded >{m.role} · {m.mobileNumber}</Text>
              </div>
            </div>
          ))}

          {showInviteForm && (
            <form onSubmit={inviteMember} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text >Invite household member</Text>
              {[
                { label: "Full name", field: "fullName", type: "text", placeholder: "e.g. Thabo Dlamini" },
                { label: "Mobile number", field: "mobileNumber", type: "tel", placeholder: "e.g. 082 123 4567" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} className="space-y-1">

                  <Input
                    label={label}
                    type={type}
                    value={newMember[field as keyof typeof newMember]}
                    onChange={(e) => setNewMember((m) => ({ ...m, [field]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>
              ))}
              {inviteError && <Text variant="body_small" className="text-ember">{inviteError}</Text>}
              <div className="flex gap-2">
                <Button variant="sec" type="button" onClick={() => setShowInviteForm(false)}
                  className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}
                  className="flex-1 ">
                  {inviting ? "Adding…" : "Add member"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Emergency access explainer */}
        <div className="rounded-2xl bg-dusk-ink/6 border border-dusk-ink/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-candlewick/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-candlewick">
                <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 6.477 6.477 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <Text>Emergency access</Text>
              <Text variant="body_small" faded className="mt-1 leading-relaxed">
                People you designate here can request access to your policy vault — even if you&apos;re not reachable. They&apos;ll verify via OTP.
              </Text>
            </div>
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Text variant="body_small" className=" uppercase tracking-wider">
              Emergency contacts
            </Text>
            <Button
              variant="sec"
              onClick={() => setShowAddForm(true)}
            >
              + Add
            </Button>
          </div>

          {(!session || session.contacts.length === 0) && !showAddForm && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 text-center">
              <Text faded className="mb-3">
                No emergency contacts yet
              </Text>
              <Button
                onClick={() => setShowAddForm(true)}
              >
                Add first contact
              </Button>
            </div>
          )}

          {session?.contacts.map((contact) => {
            const hasActiveGrant = session.activeGrants.some((g) => g.contactId === contact.id);
            return (
              <div key={contact.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dusk-ink/8 flex items-center justify-center flex-shrink-0">
                    <Text as="span" >
                      {contact.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </div>
                  <div>
                    <Text >{contact.fullName}</Text>
                    <Text variant="body_small" superFaded >
                      {contact.relationship} · {contact.mobileNumber}
                    </Text>
                  </div>
                </div>
                {!hasActiveGrant && (
                  <Button
                    onClick={() => requestGrant(contact.id)}
                    disabled={requestingGrantId === contact.id}
                    className="w-full "
                  >
                    {requestingGrantId === contact.id ? "Requesting…" : "Grant emergency access"}
                  </Button>
                )}
                {hasActiveGrant && (
                  <div className="flex items-center gap-2 rounded-xl bg-ember/6 border border-ember/15 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-ember flex-shrink-0" />
                    <Text as="span" variant="body_small" className="flex-1 text-ember">Access granted</Text>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add contact form */}
          {showAddForm && (
            <form onSubmit={saveContact} className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 space-y-3">
              <Text>Add emergency contact</Text>
              {[
                { label: "Full name", field: "fullName", type: "text", placeholder: "e.g. Thabo Dlamini" },
                { label: "Mobile number", field: "mobileNumber", type: "tel", placeholder: "e.g. 082 123 4567" },
                { label: "Relationship", field: "relationship", type: "text", placeholder: "e.g. Spouse, Sibling, Child" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field} className="space-y-1">
                  <Input
                    label={label}
                    type={type}
                    value={newContact[field as keyof typeof newContact]}
                    onChange={(e) => setNewContact((c) => ({ ...c, [field]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-xl border border-dusk-ink/15 bg-warm-paper px-3 py-3 font-sans text-sm text-dusk-ink placeholder:text-dusk-ink/30 focus:outline-none focus:ring-2 focus:ring-dusk-ink/20"
                  />
                </div>
              ))}
              {error && <Text className="font-sans text-xs text-ember">{error}</Text>}
              <div className="flex gap-2">
                <Button variant="outline_dark" type="button" onClick={() => setShowAddForm(false)} className="flex-1 ">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 ">
                  {saving ? "Saving…" : "Save contact"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Active grants */}
        {session && session.activeGrants.length > 0 && (
          <div className="space-y-2">
            <Text className="font-sans text-xs font-semibold text-dusk-ink/50 uppercase tracking-wider px-1">
              Active access grants
            </Text>
            {session.activeGrants.map((grant) => {
              const contact = session.contacts.find((c) => c.id === grant.contactId);
              return (
                <div key={grant.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-ember/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text >
                        {contact?.fullName ?? "Unknown"}
                      </Text>
                      <Text superFaded variant="body_small_sec" >
                        Expires {new Date(grant.expiresAt).toLocaleDateString("en-ZA")}
                      </Text>
                    </div>
                    <span className="rounded-full bg-ember/10 px-2.5 py-0.5 font-sans text-xs font-medium text-ember">
                      Active
                    </span>
                  </div>
                  <Button
                    variant="delete"
                    onClick={() => revokeGrant(grant.id)}
                    disabled={revokingGrantId === grant.id}
                    className="w-full"
                  >
                    {revokingGrantId === grant.id ? "Revoking…" : "Revoke access"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
