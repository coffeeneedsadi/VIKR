"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, Video, FileText, X, CheckCircle2 } from "lucide-react"
import { getMyMeetings, getAllUsers, scheduleMeeting } from "@/app/dashboard/actions/meetings"
import { createClient } from "@/utils/supabase/client"
import { MeetingsCalendar } from "@/components/MeetingsCalendar"

type Meeting = {
  id: string
  title: string
  date_time: string
  meet_link: string | null
  recording_url: string | null
  notes: string | null
}

interface UserProfile {
  id: string
  territory_code: string
  email?: string
  full_name?: string
  is_admin?: boolean
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)

  // Form state
  const [partners, setPartners] = useState<UserProfile[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [meetLink, setMeetLink] = useState("")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { success, data, error } = await getMyMeetings()
    if (success && data) {
      setMeetings(data as Meeting[])
    } else {
      setError(error || "Failed to load meetings.")
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchMeetings()

    // Check if user is admin
    async function checkAdmin() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
      if (profile?.is_admin) setIsAdmin(true)
    }
    checkAdmin()
  }, [fetchMeetings])

  const openPanel = async () => {
    setPanelOpen(true)
    setFormError(null)
    setSuccessMsg(null)
    if (partners.length === 0) {
      setIsLoadingPartners(true)
      const result = await getAllUsers()
      if (result.success && result.data) {
        setPartners(result.data as UserProfile[])
      }
      setIsLoadingPartners(false)
    }
  }

  const closePanel = () => {
    setPanelOpen(false)
    setParticipantIds([])
    setTitle("")
    setDateTime("")
    setMeetLink("")
    setRecordingUrl("")
    setNotes("")
    setFormError(null)
    setSuccessMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (participantIds.length === 0 || !title || !dateTime) {
      setFormError("Please fill out all required fields.")
      return
    }
    setIsSubmitting(true)
    setFormError(null)

    const formData = new FormData()
    participantIds.forEach(id => formData.append("participant_ids", id))
    formData.append("title", title)
    formData.append("date_time", new Date(dateTime).toISOString())
    if (meetLink) formData.append("meet_link", meetLink)
    if (recordingUrl) formData.append("recording_url", recordingUrl)
    if (notes) formData.append("notes", notes)

    const result = await scheduleMeeting(formData)

    if (result.success) {
      setSuccessMsg("Meeting scheduled successfully!")
      setParticipantIds([])
      setTitle("")
      setDateTime("")
      setMeetLink("")
      setRecordingUrl("")
      setNotes("")
      // Refresh the log
      await fetchMeetings()
    } else {
      setFormError(result.error || "Failed to create meeting.")
    }
    setIsSubmitting(false)
  }

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString)
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true }),
    }
  }

  return (
    <div className="relative p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[#0d1208] min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Meetings Log</h2>
          <p className="text-[#8aab7a] mt-1">View your past recordings and upcoming support calls.</p>
        </div>
        <Button
          onClick={openPanel}
          className="gap-2 shrink-0 bg-[#6abf30] hover:bg-[#4e9422] text-black font-bold"
        >
          <Calendar className="w-4 h-4" />
          Schedule a Call
        </Button>
      </div>

      {/* Meetings Calendar */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#4a6040]">Calendar</h3>
          <p className="text-xs text-[#4a6040] mt-0.5">Click a highlighted day to see meeting details.</p>
        </div>
        <MeetingsCalendar meetings={meetings} />
      </div>

      {/* Meetings table */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#4a6040]">All Meetings</h3>
        </div>
        <div className="rounded-xl border border-[#243018] overflow-hidden bg-[#121a0e]">
          <Table>
            <TableHeader className="bg-[#1a2413] border-b border-[#243018]">
              <TableRow>
                <TableHead className="w-[180px] text-[#8aab7a]">Date / Time</TableHead>
                <TableHead className="text-[#8aab7a]">Topic &amp; Notes</TableHead>
                <TableHead className="text-right w-[200px] text-[#8aab7a]">Links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2 text-[#8aab7a]">
                      <div className="w-4 h-4 border-2 border-[#6abf30] border-t-transparent rounded-full animate-spin" />
                      Loading meetings...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-red-400 font-medium">
                    {error}
                  </TableCell>
                </TableRow>
              ) : meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-[#4a6040] italic">
                    No meetings found in your log.
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => {
                  const { date, time } = formatDateTime(meeting.date_time)
                  const isPast = new Date(meeting.date_time) < new Date()
                  return (
                    <TableRow key={meeting.id} className="border-b border-[#243018] hover:bg-[#1a2413]">
                      <TableCell className="align-top py-4">
                        <div className="font-medium text-[#e8f0e2]">{date}</div>
                        <div className="text-sm text-[#8aab7a]">{time}</div>
                        {isPast ? (
                          <Badge variant="outline" className="mt-2 text-[10px] bg-[#243018] border-[#243018] px-1.5 py-0 italic text-[#4a6040]">PAST</Badge>
                        ) : (
                          <Badge className="mt-2 bg-[#6abf30]/20 text-[#6abf30] hover:bg-[#6abf30]/20 px-1.5 py-0 text-[10px]">UPCOMING</Badge>
                        )}
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="font-medium text-[#e8f0e2] mb-1">{meeting.title}</div>
                        {meeting.notes ? (
                          <p className="text-sm text-[#8aab7a] max-w-md line-clamp-2">{meeting.notes}</p>
                        ) : (
                          <span className="text-xs text-[#4a6040] italic">No notes provided</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right align-top py-4">
                        <div className="flex flex-col items-end gap-2">
                          {meeting.meet_link && !isPast && (
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 w-full sm:w-auto border-[#243018] text-[#e8f0e2] hover:bg-[#1a2413]" onClick={() => window.open(meeting.meet_link!, "_blank")}>
                              <ExternalLink className="w-3.5 h-3.5" /> Join Chat
                            </Button>
                          )}
                          {meeting.recording_url && (
                            <Button variant="secondary" size="sm" className="h-8 gap-1.5 w-full sm:w-auto bg-[#1a2413] text-[#6abf30] hover:bg-[#243018]" onClick={() => window.open(meeting.recording_url!, "_blank")}>
                              <Video className="w-3.5 h-3.5" /> Watch Recording
                            </Button>
                          )}
                          {!meeting.meet_link && !meeting.recording_url && (
                            <span className="text-xs text-[#4a6040] italic flex items-center gap-1"><FileText className="w-3 h-3" />Log Only</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-in panel overlay */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full z-50 w-full max-w-[480px] bg-[#0f1f0b] border-l border-[#243018] shadow-2xl flex flex-col overflow-y-auto">

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#243018] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#6abf30]/10">
                  <Calendar className="w-5 h-5 text-[#6abf30]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Schedule a Call</h3>
                  <p className="text-xs text-[#8aab7a]">Invite team members to a meeting</p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg text-[#4a6040] hover:text-[#e8f0e2] hover:bg-[#243018] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-5">

              {successMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#6abf30]/10 border border-[#6abf30]/30 text-[#6abf30] text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-400 font-medium bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {formError}
                </p>
              )}

              <div className="space-y-2">
                <Label className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Participants <span className="text-[#8aab7a] font-normal normal-case ml-1">(Who would you like to invite to this meeting?)</span> <span className="text-red-400">*</span>
                </Label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-md border border-[#243018] bg-[#121a0e]">
                  {isLoadingPartners ? (
                    <p className="text-xs text-[#8aab7a]">Loading users...</p>
                  ) : partners.filter(p => p.id !== currentUserId).length === 0 ? (
                    <p className="text-xs text-[#8aab7a]">No other users found to invite.</p>
                  ) : (
                    partners
                      .filter(p => p.id !== currentUserId)
                      .map((p) => (
                        <div key={p.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`user-${p.id}`}
                            checked={participantIds.includes(p.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setParticipantIds([...participantIds, p.id])
                              } else {
                                setParticipantIds(participantIds.filter((id) => id !== p.id))
                              }
                            }}
                            className="border-[#4a6040] data-[state=checked]:bg-[#6abf30] data-[state=checked]:text-black"
                          />
                          <Label
                            htmlFor={`user-${p.id}`}
                            className="text-sm font-medium leading-none text-[#e8f0e2] cursor-pointer"
                          >
                            {p.full_name || p.email}
                            <span className="ml-2 text-xs font-mono text-[#8aab7a] uppercase tracking-wider">
                              ({p.territory_code}{p.is_admin ? " / Admin" : ""})
                            </span>
                          </Label>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-title" className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Meeting Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="s-title"
                  placeholder="e.g. Q3 NA Sales Strategy Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-[#0d1208] border-[#243018] text-[#e8f0e2] placeholder:text-[#4a6040]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-dateTime" className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Date &amp; Time <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="s-dateTime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className="bg-[#0d1208] border-[#243018] text-[#e8f0e2]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-meetLink" className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Video Call Link <span className="text-[#4a6040] font-normal normal-case">(optional)</span>
                </Label>
                <Input
                  id="s-meetLink"
                  type="url"
                  placeholder="https://meet.google.com/xyz"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="bg-[#0d1208] border-[#243018] text-[#e8f0e2] placeholder:text-[#4a6040]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-recordingUrl" className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Recording URL <span className="text-[#4a6040] font-normal normal-case">(optional)</span>
                </Label>
                <Input
                  id="s-recordingUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="bg-[#0d1208] border-[#243018] text-[#e8f0e2] placeholder:text-[#4a6040]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-notes" className="text-[#e8f0e2] text-xs font-semibold uppercase tracking-wider">
                  Meeting Notes <span className="text-[#4a6040] font-normal normal-case">(optional)</span>
                </Label>
                <Textarea
                  id="s-notes"
                  placeholder="Agenda points or post-meeting summary…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-y bg-[#0d1208] border-[#243018] text-[#e8f0e2] placeholder:text-[#4a6040]"
                />
              </div>

              {/* Sticky footer */}
              <div className="pt-2 mt-auto flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closePanel}
                  className="flex-1 border-[#243018] text-[#8aab7a] hover:bg-[#243018] hover:text-[#e8f0e2]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingPartners}
                  className="flex-1 bg-[#6abf30] hover:bg-[#4e9422] text-black font-bold"
                >
                  {isSubmitting ? "Scheduling…" : "Schedule Meeting"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
