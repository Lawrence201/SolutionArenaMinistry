import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import { getEventById } from "@/app/actions/event";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return { title: "Invalid Event" };
  }

  const result = await getEventById(eventId);
  if (!result.success || !result.data) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${result.data.name} | Solution Arena Ministry`,
    description: result.data.description?.substring(0, 160),
  };
}

const EventDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    notFound();
  }

  const result = await getEventById(eventId);

  if (!result.success || !result.data) {
    notFound();
  }

  const event = result.data;

  // Data Formatting Helpers for Legacy Match
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatFriendlyTime = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 0, minutes || 0);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
    } catch (e) {
      return timeStr;
    }
  };

  const formatFriendlyLocation = (loc: string) => {
    if (!loc) return "";
    return loc.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Date Logic
  let displayDate = formatFriendlyDate(event.start_date);
  if (event.end_date && event.end_date !== event.start_date) {
    displayDate = `${formatFriendlyDate(event.start_date)} - ${formatFriendlyDate(event.end_date)}`;
  }

  // Time Logic
  const startTimeFormatted = formatFriendlyTime(event.start_time);
  const endTimeFormatted = formatFriendlyTime(event.end_time);
  const displayTime = endTimeFormatted ? `${startTimeFormatted} - ${endTimeFormatted}` : startTimeFormatted;

  // Location Logic
  const displayLocation = formatFriendlyLocation(event.location);

  // Description Distribution Logic (Perfect 1:1 match to legacy JS distribution)
  const cleanDesc = (event.description || "No description available.").replace(/\r/g, '').trim();
  let chunks = cleanDesc.split('\n\n').filter(p => p.trim() !== '');

  if (chunks.length < 5) {
    let allSentences: string[] = [];
    chunks.forEach(chunk => {
      const sentences = chunk.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [chunk];
      allSentences = allSentences.concat(sentences);
    });
    chunks = allSentences.map(s => s.trim()).filter(s => s !== '');
  }

  const distributeChunks = (num: number, totalContainers: number) => {
    const baseCount = Math.floor(chunks.length / totalContainers);
    let remainder = chunks.length % totalContainers;

    const containerChunks: string[][] = Array.from({ length: totalContainers }, () => []);
    let currentIdx = 0;

    for (let i = 0; i < totalContainers; i++) {
      let count = baseCount;
      if (remainder > 0) {
        count++;
        remainder--;
      }
      for (let j = 0; j < count; j++) {
        if (chunks[currentIdx]) {
          containerChunks[i].push(chunks[currentIdx]);
          currentIdx++;
        }
      }
    }
    return containerChunks;
  };

  const distributed = distributeChunks(chunks.length, 5);
  const [descTop, descSide, descBot1, descBot2, descBot3] = distributed.map(c => c.join(' '));

  return (
    <main>
      <Header />

      {/* Banner Section - Matching About Us Exactly */}
      <section className="banner position-relative" style={{ minHeight: "400px" }}>
        <div className="parallax" style={{ backgroundImage: "url(/assets/images/about.jpg)", minHeight: "600px" }}></div>
        <div className="banner-data text-center">
          <h2 className="text-white font-bold">Event Details</h2>
          <ul className="flex-all">
            <li><a href="/" className="text-white">Home</a></li>
            <li><a href="/events" className="text-white">Details</a></li>
          </ul>
        </div>
      </section>

      {/* Event Detail Content Section */}
      <section className="gap event-detail" style={{ paddingTop: '180px' }}>
        <div className="container">
          <div className="row">

            <div className="col-lg-12">
              {/* Meta Information Bar - Exact Legacy Replication */}
              <div className="event-meta w-85 m-auto" style={{ marginBottom: '50px', border: 'none' }}>
                <h2 className="w-70" id="detailEventTitle" style={{ fontSize: '55px', fontWeight: 700, marginBottom: '30px', color: '#222', fontFamily: 'Poppins, sans-serif', lineHeight: '52px' }}>
                  {event.name}
                </h2>
                <ul style={{
                  display: 'flex',
                  listStyle: 'none',
                  padding: '0',
                  margin: '0',
                  alignItems: 'center',
                  border: 'none'
                }}>
                  {/* Date Meta */}
                  <li style={{ display: 'flex', alignItems: 'center', marginRight: '65px', border: 'none' }}>
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style={{ width: '70px', height: '70px', marginRight: '15px', fill: '#1f427d', border: 'none' }}>
                      <path d="m448 64h-21.332031v-42.667969c0-11.773437-9.558594-21.332031-21.335938-21.332031h-21.332031c-11.777344 0-21.332031 9.558594-21.332031 21.332031v42.667969h-213.335938v-42.667969c0-11.773437-9.554687-21.332031-21.332031-21.332031h-21.332031c-11.777344 0-21.335938 9.558594-21.335938 21.332031v42.667969h-21.332031c-35.285156 0-64 28.714844-64 64v320c0 35.285156 28.714844 64 64 64h384c35.285156 0 64-28.714844 64-64v-320c0-35.285156-28.714844-64-64-64zm21.332031 384c0 11.753906-9.578125 21.332031-21.332031 21.332031h-384c-11.753906 0-21.332031-9.578125-21.332031-21.332031v-233.8125h426.664062zm0 0"></path>
                    </svg>
                    <ul style={{ listStyle: 'none', padding: 0, border: 'none' }}>
                      <li style={{ fontSize: '16px', color: '#666', fontWeight: 500, border: 'none' }}>Event Date</li>
                      <li style={{ border: 'none' }}><p style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#133869', lineHeight: '28px', border: 'none' }}>{displayDate}</p></li>
                    </ul>
                  </li>

                  {/* Time Meta */}
                  <li style={{ display: 'flex', alignItems: 'center', marginRight: '65px', border: 'none' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '45px', height: '45px', fill: '#1f427d', marginRight: '15px', border: 'none' }}>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                    </svg>
                    <ul style={{ listStyle: 'none', padding: 0, border: 'none' }}>
                      <li style={{ fontSize: '16px', color: '#666', fontWeight: 500, border: 'none' }}>Time</li>
                      <li style={{ border: 'none' }}><p style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#133869', lineHeight: '28px', border: 'none' }}>{displayTime}</p></li>
                    </ul>
                  </li>

                  {/* Location Meta */}
                  <li style={{ display: 'flex', alignItems: 'center', marginRight: '65px', border: 'none' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '45px', height: '45px', fill: '#1f427d', marginRight: '15px', border: 'none' }}>
                      <g>
                        <path d="M468.329,358.972c-7.263-3.989-16.382-1.336-20.369,5.924c-3.989,7.261-1.337,16.381,5.924,20.369 C471.752,395.081,482,405.963,482,415.121c0,11.201-15.87,28.561-60.413,43.694C377.582,473.767,318.775,482,256,482 s-121.582-8.233-165.587-23.185C45.87,443.683,30,426.322,30,415.121c0-9.158,10.248-20.04,28.116-29.857 c7.261-3.988,9.913-13.108,5.924-20.369c-3.989-7.26-13.106-9.913-20.369-5.924C23.749,369.916,0,388.542,0,415.121 c0,20.374,14.012,49.422,80.762,72.1C127.794,503.2,190.028,512,256,512s128.206-8.8,175.238-24.779 c66.75-22.678,80.762-51.726,80.762-72.1C512,388.542,488.251,369.916,468.329,358.972z" />
                        <path d="M142.752,437.13c30.45,8.602,70.669,13.34,113.248,13.34s82.798-4.737,113.248-13.34 c37.253-10.523,56.142-25.757,56.142-45.275c0-19.519-18.889-34.751-56.142-45.274c-8.27-2.336-17.264-4.385-26.826-6.133 c-5.193,8.972-10.634,18.207-16.323,27.708c10.584,1.588,20.521,3.535,29.545,5.834c27.416,6.983,37.432,14.844,39.491,17.866 c-2.06,3.023-12.074,10.884-39.49,17.866c-25.949,6.609-59.335,10.379-94.498,10.716c-1.703,0.126-3.419,0.197-5.147,0.197 c-1.729,0-3.444-0.071-5.148-0.197c-35.163-0.337-68.549-4.106-94.498-10.716c-27.416-6.982-37.431-14.844-39.49-17.866 c2.059-3.022,12.075-10.883,39.491-17.866c9.024-2.298,18.961-4.246,29.546-5.834c-5.689-9.5-11.13-18.737-16.323-27.708 c-9.562,1.749-18.557,3.797-26.826,6.133c-37.253,10.523-56.142,25.756-56.142,45.274 C86.61,411.373,105.499,426.606,142.752,437.13z" />
                        <path d="M256,390.634c13.353,0,25.482-6.804,32.448-18.201c48.81-79.857,106.992-185.103,106.992-232.994 C395.44,62.552,332.888,0,256,0S116.56,62.552,116.56,139.439c0,47.891,58.183,153.137,106.992,232.994 C230.518,383.83,242.648,390.634,256,390.634z M199.953,129.865c0-30.903,25.143-56.045,56.047-56.045s56.047,25.142,56.047,56.045 c0,30.904-25.143,56.046-56.047,56.046S199.953,160.77,199.953,129.865z" />
                      </g>
                    </svg>
                    <ul style={{ listStyle: 'none', padding: 0, border: 'none' }}>
                      <li style={{ fontSize: '16px', color: '#666', fontWeight: 500, border: 'none' }}>Event Location</li>
                      <li style={{ border: 'none' }}><p style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#133869', lineHeight: '28px', border: 'none' }}>{displayLocation}</p></li>
                    </ul>
                  </li>

                  {/* Tickets Meta */}
                  <li style={{ display: 'flex', alignItems: 'center', border: 'none' }}>
                    <svg viewBox="0 0 512 512" style={{ width: '45px', height: '45px', fill: '#1f427d', marginRight: '15px', border: 'none' }}>
                      <path d="M491.711,312.246h19.975V192.393h-50.937c-22.029,0-39.951-17.922-39.951-39.951c0-14.948,8.255-28.532,21.544-35.453 l17.013-8.861L408.489,0L0.782,192.304l0.042,0.089H0.314v119.853H20.29c22.029,0,39.951,17.922,39.951,39.951 c0,22.029-17.922,39.951-39.951,39.951H0.314V512h511.371V392.147h-19.975c-22.029,0-39.951-17.922-39.951-39.951 C451.759,330.168,469.681,312.246,491.711,312.246z M272.143,108.484c4.85,9.631,16.505,13.713,26.323,9.095 c9.83-4.624,14.117-16.229,9.762-26.115l81.134-38.269l18.505,39.335c-16.998,14.961-27.021,36.606-27.021,59.913 c0,14.548,3.928,28.188,10.75,39.951H94.244L272.143,108.484z M471.734,429.57v42.479h-89.889 c0-11.032-8.943-19.975-19.975-19.975c-11.032,0-19.975,8.943-19.975,19.975H40.265V429.57 c34.424-8.892,59.926-40.211,59.926-77.374c0-37.163-25.503-68.483-59.926-77.374v-42.479h301.629 c0,11.032,8.943,19.975,19.975,19.975c11.032,0,19.975-8.843,19.975-19.975h89.889v42.479 c-34.424,8.892-59.926,40.211-59.926,77.374C411.808,389.36,437.31,420.678,471.734,429.57z" />
                    </svg>
                    <ul style={{ listStyle: 'none', padding: 0, border: 'none' }}>
                      <li style={{ fontSize: '16px', color: '#666', fontWeight: 500, border: 'none' }}>Tickets Information:</li>
                      <li style={{ border: 'none' }}><p style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#133869', lineHeight: '28px', border: 'none' }}>{event.require_registration ? "Registration Required" : "Free Entry / No Registration"}</p></li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Featured Area - Exact Image/Image-provided Match */}
              <div className="featured-area position-relative overflow-hidden w-100" style={{ marginTop: '45px' }}>
                <div className="register-now" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  zIndex: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.85)', // Transparent black color requested
                  padding: '30px 0'
                }}>
                  <div className="d-flex align-items-center justify-content-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '85%', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#333'
                      }}>
                        {event.contact_person_image ? (
                          <img src={event.contact_person_image} alt="Contact" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        ) : (
                          event.contact_person?.charAt(0) || 'C'
                        )}
                      </div>
                      <div>
                        <h3 className="text-white" style={{ fontSize: '26px', margin: 0, fontWeight: 700, fontFamily: 'Poppins, sans-serif', lineHeight: '30px' }}>{event.contact_person || "Event Organizer"}</h3>
                        {(event.contact_email || event.contact_phone) && (
                          <p className="text-white" style={{ margin: 0, opacity: 0.7, fontSize: '14px', marginTop: '5px' }}>
                            {event.contact_email} {event.contact_email && event.contact_phone ? '/' : ''} {event.contact_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <a href={`/contact-us?inquiry=events&subject=${encodeURIComponent("Booking for " + event.name)}`}
                        className="theme-btn"
                        style={{
                          padding: '16px 55px',
                          backgroundColor: '#2b476b',
                          color: '#fff',
                          fontWeight: 700,
                          borderRadius: '50px',
                          textDecoration: 'none',
                          fontSize: '16px',
                          letterSpacing: '1px',
                          textTransform: 'uppercase'
                        }}>BOOK YOUR SEAT</a>
                    </div>
                  </div>
                </div>
                <img src={event.image_path || "/assets/images/event-img.webp"} alt={event.name} style={{ width: '100%', height: '530px', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>

            {/* Main Content Areas - Distributed Logic (1:1 Legacy Replication) */}
            <div className="content w-90 m-auto" style={{ paddingTop: '60px' }}>
              {/* Top Description Chunk */}
              {descTop && (
                <div dangerouslySetInnerHTML={{ __html: `<p>${descTop}</p>` }}
                  style={{ fontSize: '18px', lineHeight: '30px', color: '#666', marginBottom: '40px', fontFamily: 'Poppins, sans-serif' }} />
              )}

              {/* Ad Image 1 and Side Description */}
              <div className="event-img-list" style={{ marginTop: '55px', marginBottom: '60px' }}>
                <div className="row align-items-start">
                  <div className="col-lg-5 col-md-12 col-sm-12">
                    <img className="img-fluid w-100"
                      src={event.ad_image_1 || "/assets/images/event-img-112.webp"}
                      alt="Ad 1"
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <div className="col-lg-7 col-md-12 col-sm-12">
                    <div className="event-p-list" style={{ paddingLeft: '35px' }}>
                      <div dangerouslySetInnerHTML={{ __html: `<p>${descSide}</p>` }}
                        style={{ fontSize: '18px', lineHeight: '30px', color: '#666', fontFamily: 'Poppins, sans-serif' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Legacy Video Section (Optional) */}
              {event.ad_video_2 && (
                <div className="event-video position-relative" style={{ marginBottom: '60px', position: 'relative' }}>
                  <img className="img-fluid w-100" src="/assets/images/event-video.webp" alt="Video Placeholder" style={{ borderRadius: '15px' }} />
                  <a href={event.ad_video_2} className="flex-all pulse-anim" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#edb109',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 0 rgba(237, 177, 9, 0.7)',
                    textDecoration: 'none'
                  }}>
                    <svg viewBox="0 0 494.942 494.942" style={{ width: '30px', height: '30px', fill: '#fff' }}>
                      <path d="m35.353 0 424.236 247.471-424.236 247.471z"></path>
                    </svg>
                  </a>
                </div>
              )}

              {/* Bottom Chunk 1 (Full Width) */}
              {descBot1 && (
                <div dangerouslySetInnerHTML={{ __html: `<p>${descBot1}</p>` }}
                  style={{ fontSize: '18px', lineHeight: '30px', color: '#666', marginBottom: '40px', fontFamily: 'Poppins, sans-serif' }} />
              )}

              {/* Gallery Section - Dynamic Columns Matching User Image */}
              <div className="gallery" style={{ marginBottom: '60px' }}>
                <div className="row">
                  {event.ad_image_1 && (
                    <div className="col-lg-4 col-md-6 mb-4">
                      <img src={event.ad_image_1} className="img-fluid w-100"
                        style={{ height: '300px', objectFit: 'cover', borderRadius: '10px' }} alt="Gallery 1" />
                    </div>
                  )}
                  {event.ad_image_2 && (
                    <div className="col-lg-4 col-md-6 mb-4">
                      <img src={event.ad_image_2} className="img-fluid w-100"
                        style={{ height: '300px', objectFit: 'cover', borderRadius: '10px' }} alt="Gallery 2" />
                    </div>
                  )}
                  {/* Gallery 3 / Video Placeholder */}
                  {event.ad_video_2 && (
                    <div className="col-lg-4 col-md-6 mb-4">
                      <div style={{ position: 'relative', height: '300px' }}>
                        <img src="/assets/images/event-video.webp" className="img-fluid w-100"
                          style={{ height: '300px', objectFit: 'cover', borderRadius: '10px' }} alt="Video Frame" />
                        <a href={event.ad_video_2} className="flex-all" style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          width: '50px', height: '50px', backgroundColor: '#edb109', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <svg viewBox="0 0 494.942 494.942" style={{ width: '20px', height: '20px', fill: '#fff' }}>
                            <path d="m35.353 0 424.236 247.471-424.236 247.471z"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Description Chunks */}
              {descBot2 && (
                <div dangerouslySetInnerHTML={{ __html: `<p>${descBot2}</p>` }}
                  style={{ fontSize: '18px', lineHeight: '30px', color: '#666', marginBottom: '40px', fontFamily: 'Poppins, sans-serif' }} />
              )}
              {descBot3 && (
                <div dangerouslySetInnerHTML={{ __html: `<p>${descBot3}</p>` }}
                  style={{ fontSize: '18px', lineHeight: '30px', color: '#666', marginBottom: '60px', fontFamily: 'Poppins, sans-serif' }} />
              )}

              {/* Social Sharing - Exhaustive Legacy Fidelity */}
              <div className="social-medias" style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <ul className="flex-all justify-content-start" style={{ display: 'flex', gap: '15px', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
                  <li>
                    <a href="#" className="f-b" style={{
                      display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff',
                      fontWeight: 600, fontSize: '21px', backgroundColor: '#1e52a8',
                      padding: '20px 50px', borderRadius: '100px', transition: '0.3s'
                    }}>
                      <svg style={{ width: '20px', height: '20px', fill: '#fff', marginRight: '10px' }} viewBox="0 0 24 24">
                        <path d="m15.997 3.985h2.191v-3.816c-.378-.052-1.678-.169-3.192-.169-3.159 0-5.323 1.987-5.323 5.639v3.361h-3.486v4.266h3.486v10.734h4.274v-10.733h3.345l.531-4.266h-3.877v-2.939c.001-1.233.333-2.077 2.051-2.077z"></path>
                      </svg> Facebook
                    </a>
                  </li>
                  <li>
                    <a href="#" className="twitr" style={{
                      display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff',
                      fontWeight: 600, fontSize: '21px', backgroundColor: '#4380e4',
                      padding: '20px 50px', borderRadius: '100px', transition: '0.3s'
                    }}>
                      <svg style={{ width: '20px', height: '20px', fill: '#fff', marginRight: '10px' }} viewBox="0 0 512 512">
                        <path d="M512,97.248c-19.04,8.352-39.328,13.888-60.48,16.576c21.76-12.992,38.368-33.408,46.176-58.016 c-20.288,12.096-42.688,20.64-66.56,25.408C411.872,60.704,384.416,48,354.464,48c-58.112,0-104.896,47.168-104.896,104.992 c0,8.32,0.704,16.32,2.432,23.936c-87.264-4.256-164.48-46.08-216.352-109.792c-9.056,15.712-14.368,33.696-14.368,53.056 c0,36.352,18.72,68.576,46.624,87.232c-16.864-0.32-33.408-5.216-47.424-12.928c0,0.32,0,0.736,0,1.152 c0,51.008,36.384,93.376,84.096,103.136c-8.544,2.336-17.856,3.456-27.52,3.456c-6.72,0-13.504-0.384-19.872-1.792 c13.6,41.568,52.192,72.128,98.08,73.12c-35.712,27.936-81.056,44.768-130.144,44.768c-8.608,0-16.864-0.384-25.12-1.44 C46.496,446.88,101.6,464,161.024,464c193.152,0,298.752-160,298.752-298.688c0-4.64-0.16-9.12-0.384-13.568 C480.224,136.96,497.728,118.496,512,97.248z"></path>
                      </svg> Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="insta" style={{
                      display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff',
                      fontWeight: 600, fontSize: '21px', backgroundColor: '#d221cc',
                      padding: '20px 50px', borderRadius: '100px', transition: '0.3s'
                    }}>
                      <svg style={{ width: '20px', height: '20px', fill: '#fff', marginRight: '10px' }} viewBox="0 0 511 511.9">
                        <path d="m510.949219 150.5c-1.199219-27.199219-5.597657-45.898438-11.898438-62.101562-6.5-17.199219-16.5-32.597657-29.601562-45.398438-12.800781-13-28.300781-23.101562-45.300781-29.5-16.296876-6.300781-34.898438-10.699219-62.097657-11.898438-27.402343-1.300781-36.101562-1.601562-105.601562-1.601562s-78.199219.300781-105.5 1.5c-27.199219 1.199219-45.898438 5.601562-62.097657 11.898438-17.203124 6.5-32.601562 16.5-45.402343 29.601562-13 12.800781-23.097657 28.300781-29.5 45.300781-6.300781 16.300781-10.699219 34.898438-11.898438 62.097657-1.300781 27.402343-1.601562 36.101562-1.601562 105.601562s.300781 78.199219 1.5 105.5c1.199219 27.199219 5.601562 45.898438 11.902343 62.101562 6.5 17.199219 16.597657 32.597657 29.597657 45.398438 12.800781 13 28.300781 23.101562 45.300781 29.5 16.300781 6.300781 34.898438 10.699219 62.101562 11.898438 27.296876 1.203124 36 1.5 105.5 1.5s78.199219-.296876 105.5-1.5c27.199219-1.199219 45.898438-5.597657 62.097657-11.898438 34.402343-13.300781 61.601562-40.5 74.902343-74.898438 6.296876-16.300781 10.699219-34.902343 11.898438-62.101562 1.199219-27.300781 1.5-36 1.5-105.5s-.101562-78.199219-1.300781-105.5zm-46.097657 209c-1.101562 25-5.300781 38.5-8.800781 47.5-8.601562 22.300781-26.300781 40-48.601562 48.601562-9 3.5-22.597657 7.699219-47.5 8.796876-27 1.203124-35.097657 1.5-103.398438 1.5s-76.5-.296876-103.402343-1.5c-25-1.097657-38.5-5.296876-47.5-8.796876-11.097657-4.101562-21.199219-10.601562-29.398438-19.101562-8.5-8.300781-15-18.300781-19.101562-29.398438-3.5-9-7.699219-22.601562-8.796876-47.5-1.203124-27-1.5-35.101562-1.5-103.402343s.296876-76.5 1.5-103.398438c1.097657-25 5.296876-38.5 8.796876-47.5 4.101562-11.101562 10.601562-21.199219 19.203124-29.402343 8.296876-8.5 18.296876-15 29.398438-19.097657 9-3.5 22.601562-7.699219 47.5-8.800781 27-1.199219 35.101562-1.5 103.398438-1.5 68.402343 0 76.5.300781 103.402343 1.5 25 1.101562 38.5 5.300781 47.5 8.800781 11.097657 4.097657 21.199219 10.597657 29.398438 19.097657 8.5 8.300781 15 18.300781 19.101562 29.402343 3.5 9 7.699219 22.597657 8.800781 47.5 1.199219 27 1.5 35.097657 1.5 103.398438s-.300781 76.300781-1.5 103.300781zm0 0" />
                        <path d="m256.449219 124.5c-72.597657 0-131.5 58.898438-131.5 131.5s58.902343 131.5 131.5 131.5c72.601562 0 131.5-58.898438 131.5-131.5s-58.898438-131.5-131.5-131.5zm0 216.800781c-47.097657 0-85.300781-38.199219-85.300781-85.300781s38.203124-85.300781 85.300781-85.300781c47.101562 0 85.300781 38.199219 85.300781 85.300781s-38.199219 85.300781-85.300781 85.300781zm0 0"></path>
                        <path d="m423.851562 119.300781c0 16.953125-13.746093 30.699219-30.703124 30.699219-16.953126 0-30.699219-13.746094-30.699219-30.699219 0-16.957031 13.746093-30.699219 30.699219-30.699219 16.957031 0 30.703124 13.742188 30.703124 30.699219zm0 0"></path>
                      </svg> Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="utube" style={{
                      display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff',
                      fontWeight: 600, fontSize: '21px', backgroundColor: '#e20e13',
                      padding: '20px 50px', borderRadius: '100px', transition: '0.3s'
                    }}>
                      <svg style={{ width: '20px', height: '20px', fill: '#fff', marginRight: '10px' }} viewBox="0 0 494.942 494.942">
                        <path d="m35.353 0 424.236 247.471-424.236 247.471z"></path>
                      </svg> Youtube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div >
        </div >
      </section >

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
         .event-detail .event-meta ul > li {
            border-right: 1px solid #eee;
            padding-right: 30px;
         }
         .event-detail .event-meta ul > li:last-child {
            border-right: 0;
            padding-right: 0;
         }
         .pulse-anim {
            animation: pulse-border 1.5s infinite;
         }
         @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(237, 177, 9, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(237, 177, 9, 0); }
            100% { box-shadow: 0 0 0 0 rgba(237, 177, 9, 0); }
         }

         /* User-specified Responsive Media Queries (1028px, 780px, 480px, 420px) */
      @media (max-width: 1028px) {

  .event-detail {
    padding-top: 100px !important;
  }
  /* Event Meta Section */
  .event-detail .event-meta {
    width: 95% !important;
  }

  .event-detail .event-meta ul {
    flex-wrap: wrap !important;
    gap: 25px;
  }

  .event-detail .event-meta ul > li {
    width: 48% !important;
    margin-right: 0 !important;
    padding-right: 0 !important;
    border-right: 0 !important;
  }

  .event-detail .event-meta ul > li svg {
    width: 40px !important;
    height: 40px !important;
    flex-shrink: 0 !important;
    margin-right: 15px !important;
    margin-bottom: 0 !important;
  }

  /* Event Title */
  #detailEventTitle {
    font-size: 40px !important;
    line-height: 46px !important;
  }

  /* Register Bar */
  .register-now {
    position: relative !important;
    padding: 15px 20px !important;
    background-color: rgba(19, 19, 19, 0.9) !important;
    margin-top: 0 !important;
  }
  
  .register-now .d-flex {
    flex-direction: column !important;
    text-align: left !important;
    align-items: flex-start !important;
    gap: 10px !important;
    width: 100% !important;
  }
  
  .register-now .d-flex > div:first-child {
    flex-direction: row !important;
    align-items: center !important;
    gap: 20px !important;
  }

  .register-now .d-flex > div:first-child > div:first-child {
    width: 65px !important;
    height: 65px !important;
    border: 3px solid #3c1e5e !important;
    box-shadow: 0 0 15px rgba(102, 51, 153, 0.6) !important;
  }
  
  .register-now .d-flex > div:first-child > div:first-child img {
    object-fit: cover !important;
    object-position: top !important;
  }
  
  .register-now h3 {
    font-size: 32px !important;
    margin-bottom: 5px !important;
  }
  
  .register-now p {
    font-size: 18px !important;
    opacity: 1 !important;
  }
  
  .register-now .theme-btn {
    padding: 12px 35px !important;
    font-size: 15px !important;
    width: auto !important;
    display: inline-block !important;
    border-radius: 50px !important;
    background-color: #2b476b !important;
  }

  /* Content spacing */
  .event-detail .content {
    width: 95% !important;
  }

  .event-detail .content .event-img-list {
    margin-top: 30px !important;
  }

  /* Social buttons */
  .social-medias ul {
    justify-content: flex-start !important;
  }
  
  .social-medias ul li a {
    padding: 10px 30px !important;
    font-size: 16px !important;
    border-radius: 50px !important;
    background-color: #2b476b !important;
  }
}


@media (max-width: 780px) {
  /* Banner */
  .banner {
    min-height: 300px !important;
  }

  .banner .parallax {
    min-height: 400px !important;
  }

  .banner-data h2 {
    font-size: 34px !important;
    line-height: 40px !important;
  }

  /* Event Meta Section */
  .event-detail .event-meta {
    width: 100% !important;
  }

  .event-detail .event-meta ul {
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 30px;
  }

  .event-detail .event-meta ul > li {
    width: 100% !important;
    border-right: 0 !important;
    padding-right: 0 !important;
  }

  .event-detail .event-meta ul > li svg {
    width: 32px !important;
    height: 32px !important;
    flex-shrink: 0 !important;
    margin-right: 15px !important;
    margin-bottom: 0 !important;
  }

  #detailEventTitle {
    font-size: 32px !important;
    line-height: 38px !important;
  }

  /* Register Bar */
  .register-now {
    padding: 10px 15px !important;
  }

  .register-now .d-flex {
    gap: 10px !important;
  }

  .register-now .d-flex > div:first-child {
    flex-direction: row !important;
    align-items: center !important;
    gap: 15px !important;
  }

  .register-now h3 {
    font-size: 20px !important;
  }

  .register-now p {
    font-size: 15px !important;
  }

  .register-now .theme-btn {
    width: 100%;
    text-align: center;
    padding: 14px 0 !important;
    font-size: 14px !important;
  }

  /* Featured Image */
  .featured-area img {
    height: 380px !important;
  }

  /* Content */
  .event-detail .content {
    width: 100% !important;
    padding-top: 40px !important;
  }

  .event-detail .content p {
    font-size: 17px !important;
    line-height: 28px !important;
  }

  /* Image + Text Stack */
  .event-img-list .row {
    flex-direction: column !important;
  }

  .event-img-list img {
    margin-bottom: 20px;
  }

  .event-detail .event-p-list {
    padding-left: 0 !important;
  }

  /* Video Section */
  .event-detail .content .event-video a {
    width: 70px !important;
    height: 70px !important;
  }

  /* Gallery */
  .gallery .col-lg-4,
  .gallery .col-md-6 {
    width: 100% !important;
  }

  .gallery img {
    height: 260px !important;
  }

  /* Social Media Buttons */
  .social-medias ul {
    justify-content: flex-start !important;
  }
  
  .social-medias ul li a {
    width: auto !important;
    justify-content: center;
    font-size: 16px !important;
    padding: 10px 30px !important;
    border-radius: 50px !important;
    background-color: #2b476b !important;
  }
}

@media (max-width: 480px) {
  /* Banner */
  .banner {
    min-height: 250px !important;
  }

  .banner .parallax {
    min-height: 320px !important;
  }

  .banner-data h2 {
    font-size: 26px !important;
    line-height: 32px !important;
  }

  .banner-data ul {
    font-size: 14px !important;
  }

  /* Event Title */
  #detailEventTitle {
    font-size: 26px !important;
    line-height: 32px !important;
  }

  /* Event Meta */
  .event-detail .event-meta ul > li {
    flex-direction: row !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 10px !important;
  }

  .event-detail .event-meta ul > li svg {
    width: 28px !important;
    height: 28px !important;
    flex-shrink: 0 !important;
    margin-right: 15px !important;
    margin-bottom: 0 !important;
  }

  .event-detail .event-meta ul > li p {
    font-size: 15px !important;
  }

  /* Register Section */
  .register-now {
    padding: 5px !important;
  }

  .register-now h3 {
    font-size: 18px !important;
  }

  .register-now p {
    font-size: 14px !important;
  }

  .register-now .theme-btn {
    font-size: 13px !important;
    padding: 10px 30px !important;
    border-radius: 50px !important;
    background-color: #2b476b !important;
  }

  /* Featured Image */
  .featured-area img {
    height: 180px !important;
  }

  /* Content Paragraphs */
  .event-detail .content p {
    font-size: 16px !important;
    line-height: 26px !important;
  }

  /* Video Button */
  .event-detail .content .event-video a {
    width: 60px !important;
    height: 60px !important;
  }

  .event-detail .content .event-video a svg {
    width: 18px !important;
    height: 18px !important;
  }

  /* Gallery */
  .gallery img {
    height: 220px !important;
  }

  /* Social Buttons */
  .social-medias {
    margin-top: 30px !important;
  }

  .social-medias ul {
    gap: 10px !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }

  .social-medias ul li {
    width: auto !important;
  }

  .social-medias ul li a {
    font-size: 14px !important;
    padding: 8px 25px !important;
    border-radius: 50px !important;
    background-color: #2b476b !important;
  }
}





      ` }} />
    </main >
  );
};

export default EventDetailPage;
