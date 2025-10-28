"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { PageNavigation } from "@/components/page-navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

interface DiscordEvent {
  id: string;
  name: string;
  description: string;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  guildInvite?: string;
  creator?: {
    username: string;
  };
}

export default function CalendarPage() {
  const { address, isConnected } = useAccount();
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchDiscordEvents();
  }, []);

  const fetchDiscordEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discord/events');
      const data = await response.json();

      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching Discord events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDay = (day: number) => {
    const dateToCheck = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    return events.filter(event => {
      const eventDate = new Date(event.scheduledStartTime);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="w-full">
        <div className="w-full max-w-screen-lg mx-auto -mt-6 px-4 md:px-8 relative z-10 mb-4">
          <PageNavigation />
        </div>
        <div className="w-full max-w-screen-lg mx-auto px-4 md:px-8 pb-16">
          <div className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded mb-8" />
          <div className="h-96 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-screen-lg mx-auto -mt-6 px-4 md:px-8 relative z-10 mb-4">
        <PageNavigation />
      </div>
      <div className="w-full max-w-screen-lg mx-auto px-4 md:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 md:h-8 md:w-8" />
            Discord Events Calendar
          </h1>
        </div>

        <>
            <Card className="p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <Button onClick={previousMonth} variant="outline">
                  ← Previous
                </Button>
                <h2 className="text-lg md:text-xl font-bold">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button onClick={nextMonth} variant="outline">
                  Next →
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm py-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={`aspect-square border rounded-lg p-1 md:p-2 ${
                        isToday ? 'border-primary bg-primary/5' : 'border-zinc-200'
                      } hover:bg-zinc-50 transition-colors`}
                    >
                      <div className="text-xs md:text-sm font-semibold mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                            title={`${event.name}\n${event.guildName}\n${new Date(event.scheduledStartTime).toLocaleTimeString()}`}
                          >
                            {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming Events List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Upcoming Events</h2>
              {events.length === 0 ? (
                <Card className="p-6 text-center space-y-4">
                  <p className="text-muted-foreground">
                    No upcoming Discord events found.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Events from all servers where the Telescope bot is installed will appear here.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/calendar/invite-bot'}
                    variant="outline"
                  >
                    Invite Bot to More Servers
                  </Button>
                </Card>
              ) : (
                events
                  .filter(event => new Date(event.scheduledStartTime) >= new Date())
                  .sort((a, b) =>
                    new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
                  )
                  .slice(0, 10)
                  .map(event => (
                    <Card key={event.id} className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Server Icon */}
                        {event.guildIcon && (
                          <img
                            src={event.guildIcon}
                            alt={event.guildName}
                            className="w-12 h-12 rounded-lg flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                {event.guildName}
                                {event.guildInvite && (
                                  <Button
                                    size="sm"
                                    variant="link"
                                    className="h-auto p-0 text-xs text-blue-500"
                                    onClick={() => window.open(event.guildInvite, '_blank')}
                                  >
                                    Join Server →
                                  </Button>
                                )}
                              </p>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm mb-2">{event.description}</p>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              {new Date(event.scheduledStartTime).toLocaleString()}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  eventId: event.id,
                                  name: event.name,
                                  description: event.description || "",
                                  startTime: event.scheduledStartTime,
                                  ...(event.scheduledEndTime && { endTime: event.scheduledEndTime }),
                                  location: `Discord - ${event.guildName}`,
                                });
                                window.open(`/api/discord/events/export?${params.toString()}`, '_blank');
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Calendar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </>
      </div>
    </div>
  );
}
