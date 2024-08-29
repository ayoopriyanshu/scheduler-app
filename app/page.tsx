"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DropArg } from "@fullcalendar/interaction";
import { crossIcon, eventIcon, exclIcon } from "./icons/icons.jsx";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { EventClickArg, EventSourceInput } from "@fullcalendar/core/index.js";
import Image from "next/image";

interface Event {
  title: string;
  description: string;
  start: Date | string;
  hoursTime: string;
  color: string;
  allDay: boolean;
  id: number;
  imageUrl: string;
}

export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    description: "",
    start: "",
    hoursTime: "",
    color: "blue",
    imageUrl: "",
    allDay: false,
    id: 0,
  });

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    setNewEvent({
      ...newEvent,
      // start: arg.date,
      start: arg.date.toISOString(),
      allDay: arg.allDay,
      id: new Date().getTime(),
      imageUrl: "",
      color: "blue",
    });
    setShowModal(true);
  }

  function addEvent(data: DropArg) {
    const event = {
      ...newEvent,
      start: data.date.toISOString(),
      title: data.draggedEl.innerText,
      allDay: data.allDay,
      id: new Date().getTime(),
    };
    setAllEvents([...allEvents, event]);
  }

  function handleDeleteModal(data: { event: { id: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
  }

  function handleDelete() {
    setAllEvents(
      allEvents.filter((event) => Number(event.id) !== Number(idToDelete))
    );
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewEvent({
      title: "",
      description: "",
      start: "",
      hoursTime: "",
      color: "blue",
      imageUrl: "",
      allDay: false,
      id: 0,
    });
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const eventDetails = [...allEvents, newEvent];
    setAllEvents(eventDetails);
    console.log(newEvent.start);
    handleCloseModal();
  }

  function handleUpdateEvent(arg: { event: { id: string } }) {
    const event = allEvents.find((e) => e.id === Number(arg.event.id));
    if (event) {
      setEventToUpdate(event);
      setShowUpdateModal(true);
    }
  }

  function handleUpdateChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (eventToUpdate) {
      setEventToUpdate({
        ...eventToUpdate,
        [name]: value,
      });
    }
  }

  function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (eventToUpdate) {
      setAllEvents(
        allEvents.map((event) =>
          event.id === eventToUpdate.id ? eventToUpdate : event
        )
      );
      setShowUpdateModal(false);
      setEventToUpdate(null);
    }
  }

  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  const handleEventClick = (data: EventClickArg) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleUpdateEvent(data);
    } else {
      clickTimer = setTimeout(() => {
        handleDeleteModal(data);
        clickTimer = null;
      }, 300);
    }
  };

  return (
    <>
      <nav className="flex justify-between mb-0 border-b border-blue-100 p-5">
        <h1
          className={`font-bold pl-5 pt-1 text-2xl ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Scheduler
        </h1>
        <button
          className={`px-5 mr-5 font-bold rounded ${
            theme === "dark"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </nav>
      <p
        className={`p-2 text-sm italic font-sans ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}
      >
        *click the event to delete, double click to update
      </p>
      <main className="flex min-h-screen flex-col items-center pt-16">
        <div className="w-full h-full mb-0">
          <div className="flex justify-center col-span-8">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: "prevYear prev,next nextYear",
                center: "title",
                right: "dayGridMonth today timeGridWeek",
              }}
              events={allEvents as EventSourceInput}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              dateClick={handleDateClick}
              drop={(data) => addEvent(data)}
              eventClick={(data) => handleEventClick(data)}
              eventContent={(eventInfo) => {
                return (
                  <div>
                    <div className="flex justify-between">
                      <div className="ml-1 text-lg">
                        {eventInfo.event.title}
                      </div>
                      <img
                        src={eventIcon}
                        width="20"
                        height="20"
                        className="mr-1 mt-1 cursor-pointer"
                      />
                    </div>
                    <div className="ml-1 italic text-xs">
                      {eventInfo.event.extendedProps.description}
                    </div>
                    <div className="pt-3 ml-1">
                      {eventInfo.event.extendedProps.imageUrl && (
                        <Image
                          src={eventInfo.event.extendedProps.imageUrl}
                          alt="Event"
                          className="w-30 h-30 mt-2 mb-1 ml-1"
                          height={96}
                          width={96}
                        />
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setShowDeleteModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div
                      className={` ${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                      } p-3 pt-5 pb-5`}
                    >
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <div className="flex justify-between mb-3 pr-3">
                          <Dialog.Title
                            as="h3"
                            className={`text-lg font-semibold leading-6 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-900"
                            }`}
                          >
                            Delete Event
                          </Dialog.Title>
                          <img src={exclIcon} width="20" height="13" />
                        </div>
                        <div className="mt-2">
                          <p
                            className={`text-md ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            Are you sure you want to delete this event?
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-6">
                        <button
                          type="button"
                          className="bg-red-600 text-white px-3 py-1 mr-2 rounded-md"
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="bg-blue-500 text-white px-3 py-1 mr-2 rounded-md"
                          onClick={handleCloseModal}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className={`relative transform overflow-hidden rounded-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}
                  >
                    <div>
                      <div className="">
                        <div className="flex justify-between mb-3">
                          <Dialog.Title
                            as="h3"
                            className={`text-base font-semibold leading-6 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-900"
                            }`}
                          >
                            Add Event
                          </Dialog.Title>
                          <button type="button" onClick={handleCloseModal}>
                            <img src={crossIcon} width="15" height="13" />
                          </button>
                        </div>
                        <form action="submit" onSubmit={handleSubmit}>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              required
                              className={` ${
                                theme === "dark" ? "bg-gray-300" : "bg-white"
                              } block w-full rounded-md border-0 py-1.5 text-gray-900
                            shadow-sm ring-1 ring-inset ring-gray-300 
                            ${
                              theme === "dark"
                                ? "placeholder:text-gray-500"
                                : "placeholder:text-gray-400"
                            }
                            focus:ring-2
                            focus:ring-inset focus:ring-blue-300
                            sm:text-sm sm:leading-6 `}
                              value={newEvent.title}
                              onChange={(e) => handleChange(e)}
                              placeholder="Title"
                            />
                            <input
                              type="text"
                              name="description"
                              className={`block w-full rounded-md ${
                                theme === "dark" ? "bg-gray-300" : "bg-white"
                              } mt-2 border-0 py-1.5 text-gray-900
                            shadow-sm ring-1 ring-inset ring-gray-300 
                            ${
                              theme === "dark"
                                ? "placeholder:text-gray-500"
                                : "placeholder:text-gray-400"
                            }
                            focus:ring-2
                            focus:ring-inset focus:ring-blue-300
                            sm:text-sm sm:leading-6 pb-20 italic`}
                              value={newEvent.description}
                              onChange={(e) => handleChange(e)}
                              placeholder="Description"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p
                                className={`mr-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-900"
                                }`}
                              >
                                Schedule:
                              </p>
                              <input
                                type="datetime-local"
                                id="start"
                                name="start"
                                required
                                value={newEvent.start as string}
                                onChange={(e) => handleChange(e)}
                                className={`block border-none py-2 mr-2  mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300 bg-gray-800"
                                    : "text-gray-900"
                                } sm:text-sm `}
                              />
                            </div>
                            <div className="flex items-center">
                              <p
                                className={`mr-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-900"
                                }`}
                              >
                                Color:
                              </p>
                              <select
                                name="color"
                                value={newEvent.color}
                                onChange={(e) => handleChange(e)}
                                className={`block border-none py-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300 bg-gray-800"
                                    : "text-gray-900"
                                } sm:text-sm`}
                              >
                                <option value="blue">🔵</option>
                                <option value="red">🔴</option>
                                <option value="green">🟢</option>
                                <option value="purple">🟣</option>
                              </select>
                            </div>
                          </div>
                          <div
                            className="block w-full rounded-md mt-2 border-0 py-1.5 text-gray-900
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                            focus:ring-2
                            focus:ring-inset focus:ring-blue-300
                            sm:text-sm sm:leading-6 p-1 pb-2.5"
                          >
                            <input
                              type="file"
                              id="image"
                              name="image"
                              accept="image/*"
                              onChange={handleFileChange}
                              className={`${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-black"
                              } mt-1`}
                            />
                          </div>

                          <div className="flex justify-end pt-5">
                            <button
                              type="submit"
                              className="bg-blue-500 text-white px-4 py-2 cursor-pointer mr-2 rounded-md"
                              disabled={
                                newEvent.title === "" &&
                                newEvent.description === ""
                              }
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showUpdateModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setShowUpdateModal(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className={`relative transform overflow-hidden rounded-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}
                  >
                    <div>
                      <div className="flex justify-between mb-3">
                        <Dialog.Title
                          as="h3"
                          className={`text-base font-semibold leading-6 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          Update Event
                        </Dialog.Title>
                        <button
                          type="button"
                          onClick={() => setShowUpdateModal(false)}
                        >
                          <img src={crossIcon} width="15" height="13" />
                        </button>
                      </div>
                      {eventToUpdate && (
                        <form onSubmit={handleUpdateSubmit}>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              required
                              className={`${
                                theme === "dark" ? "bg-gray-300" : "bg-white"
                              } block w-full rounded-md border-0 py-1.5 text-gray-900
                      shadow-sm ring-1 ring-inset ring-gray-300
                      ${
                        theme === "dark"
                          ? "placeholder:text-gray-500"
                          : "placeholder:text-gray-400"
                      }
                      focus:ring-2
                      focus:ring-inset focus:ring-blue-300
                      sm:text-sm sm:leading-6 `}
                              value={eventToUpdate.title}
                              onChange={(e) => handleUpdateChange(e)}
                              placeholder="Title"
                            />
                            <input
                              type="text"
                              name="description"
                              className={`block w-full rounded-md ${
                                theme === "dark" ? "bg-gray-300" : "bg-white"
                              } mt-2 border-0 py-1.5 text-gray-900
                      shadow-sm ring-1 ring-inset ring-gray-300
                      ${
                        theme === "dark"
                          ? "placeholder:text-gray-500"
                          : "placeholder:text-gray-400"
                      }
                      focus:ring-2
                      focus:ring-inset focus:ring-blue-300
                      sm:text-sm sm:leading-6 pb-20 italic`}
                              value={eventToUpdate.description}
                              onChange={(e) => handleUpdateChange(e)}
                              placeholder="Description"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p
                                className={`mr-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-900"
                                }`}
                              >
                                Schedule:
                              </p>
                              <input
                                type="datetime-local"
                                id="start"
                                name="start"
                                value={eventToUpdate.start as string}
                                onChange={(e) => handleUpdateChange(e)}
                                className={`block border-none py-2 mr-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300 bg-gray-800"
                                    : "text-gray-900"
                                } sm:text-sm`}
                              />
                            </div>
                            <div className="flex items-center">
                              <p
                                className={`mr-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-900"
                                }`}
                              >
                                Color:
                              </p>
                              <select
                                name="timeSpan"
                                value={eventToUpdate.color}
                                onChange={(e) => handleUpdateChange(e)}
                                className={`block border-none py-2 mt-2 ${
                                  theme === "dark"
                                    ? "text-gray-300 bg-gray-800"
                                    : "text-gray-900"
                                } sm:text-sm`}
                              >
                                <option value="blue">🔵</option>
                                <option value="red">🔴</option>
                                <option value="green">🟢</option>
                                <option value="purple">🟣</option>
                              </select>
                            </div>
                          </div>
                          <div
                            className="block w-full rounded-md mt-2 border-0 py-1.5 text-gray-900
                    shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400
                    focus:ring-2
                    focus:ring-inset focus:ring-blue-300
                    sm:text-sm sm:leading-6 p-1 pb-2.5"
                          >
                            <input
                              type="file"
                              id="image"
                              name="image"
                              accept="image/*"
                              onChange={handleFileChange}
                              className={`${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-black"
                              } mt-1`}
                            />
                          </div>

                          <div className="flex justify-end pt-5">
                            <button
                              type="submit"
                              className="bg-blue-500 text-white px-4 py-2 cursor-pointer mr-2 rounded-md"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="bg-gray-500 text-white px-4 py-2 cursor-pointer rounded-md"
                              onClick={() => setShowUpdateModal(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
}
