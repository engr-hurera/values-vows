import { describe, expect, it } from "vitest";
import { ACTIVE_CHAT_CAP, activeCount, connect, endChat, findThread, guardianCC, reportAndFreeze, seedState, sendMessage, startChat } from "@/lib/chat-store";
import { getProfile } from "@/lib/profiles";

describe("Matches & chaperoned chat rules", () => {
  it("caps active chats at 3", () => expect(ACTIVE_CHAT_CAP).toBe(3));

  it("starts with 2 of 3 active chats", () => expect(activeCount(seedState("man"))).toBe(2));

  it("only matches the opposite gender", () => {
    const s = seedState("woman");
    expect([...s.matches, ...s.proposals].every((id) => getProfile(id)?.gender === "man")).toBe(true);
  });

  it("blocks a 4th active chat", () => {
    const s = seedState("man");
    const third = startChat(s, s.matches[2]!).state;
    expect(activeCount(third)).toBe(3);
    const r = startChat(third, s.matches[3]!);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toBe("cap");
    expect(findThread(r.state, s.matches[3]!)).toBeUndefined();
  });

  it("frees a slot when a chat is ended", () => {
    const s = seedState("man");
    const full = startChat(s, s.matches[2]!).state;
    expect(startChat(endChat(full, s.matches[0]!), s.matches[3]!).ok).toBe(true);
  });

  it("creates a mutual match when connecting with someone who proposed", () => {
    const s = seedState("man");
    const r = connect(s, s.proposals[0]!);
    expect(r.mutual).toBe(true);
    expect(r.state.matches).toContain(s.proposals[0]);
  });

  it("only sends a request when the other person has not proposed", () => {
    const r = connect(seedState("man"), "maryam");
    expect(r.mutual).toBe(false);
    expect(r.state.matches).not.toContain("maryam");
  });

  it("Report & Freeze locks the chat and logs a safety report", () => {
    const s = seedState("man");
    const id = s.threads[0]!.profileId;
    const { state, report } = reportAndFreeze(s, id);
    expect(findThread(state, id)?.status).toBe("frozen");
    expect(state.reports).toContainEqual(report);
    const before = findThread(state, id)!.messages.length;
    expect(findThread(sendMessage(state, id, { kind: "text", text: "hi" }), id)!.messages.length).toBe(before);
  });

  it("shows Guardian CC when a Guardian WhatsApp number is added with updates on", () => {
    expect(guardianCC({ guardianWhatsapp: "+2348000000000", guardianUpdates: true }, { waliLinked: false })).toBe(true);
    expect(guardianCC({ guardianWhatsapp: "", guardianUpdates: false }, { waliLinked: false })).toBe(false);
    expect(guardianCC({ guardianWhatsapp: "", guardianUpdates: false }, { waliLinked: true })).toBe(true);
  });
});
