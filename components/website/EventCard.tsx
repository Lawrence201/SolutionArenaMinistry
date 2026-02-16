"use client";

import Link from "next/link";

interface EventCardProps {
  id: number;
  name: string;
  image_path: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  time_range: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  name,
  image_path,
  location,
  start_date,
  end_date,
  time_range,
  contact_person,
  contact_phone,
  contact_email,
}) => {
  return (
    <div className="col-lg-4 col-md-6 col-sm-12">
      <div className="event">
        <img
          src={image_path}
          alt={name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/images/event-img-1.webp";
          }}
        />
        <div className="event-data">
          <p className="location text-white">{location}</p>
          <h4>
            <Link href={`/events/${id}`} tabIndex={0}>
              {name}
            </Link>
          </h4>
          <ul>
            <li>
              <img src="/assets/images/calendar.svg" alt="calendar" />
              Start: {start_date}
            </li>
            {end_date && end_date !== start_date && (
              <li>
                <img src="/assets/images/calendar.svg" alt="calendar" />
                End: {end_date}
              </li>
            )}
            <li>
              <img src="/assets/images/clock.svg" alt="clock" />
              {time_range}
            </li>
          </ul>

          <div className="contact-info">
            {contact_person && (
              <p>
                <i className="fa fa-user"></i> {contact_person}
              </p>
            )}
            {contact_phone && (
              <p>
                <i className="fa fa-phone"></i> {contact_phone}
              </p>
            )}
            {contact_email && (
              <p>
                <i className="fa fa-envelope"></i> {contact_email}
              </p>
            )}
          </div>

          <Link className="theme-btn view-detail-btn" href={`/events/${id}`} tabIndex={0}>
            View Detail
          </Link>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .events .event {
            position: relative;
            overflow: hidden;
            margin-bottom: 30px;
            border-radius: 12px;
            background: #f4f4f4;
            height: 530px;
          }

          .events .event > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }

          .events .event::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40%;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
            transition: all 0.4s ease;
            z-index: 1;
          }

          .events .event:hover::after {
            height: 100%;
            background: rgba(31, 67, 114, 0.95); /* Dark blue overlay */
          }

          .events .event:hover > img {
            transform: scale(1.1);
          }

          .events .event .event-data {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 40px 30px;
            z-index: 2;
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            text-align: left;
            transition: all 0.4s ease;
          }

          .events .event:hover .event-data {
            justify-content: center;
          }

          .events .event .event-data p.location {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 5px;
            text-transform: capitalize;
            transform: translateY(0);
            transition: transform 0.4s ease;
          }

          .events .event .event-data h4 {
            margin-bottom: 25px;
            transition: all 0.4s ease;
          }

          .events .event:hover .event-data h4 {
            margin-bottom: 25px;
          }

          .events .event .event-data h4 a {
            color: #fff;
            text-decoration: none;
            font-size: 30px;
            font-weight: 700;
            line-height: 1.1;
            transition: color 0.3s ease;
          }

          .events .event .event-data h4 a:hover {
            color: #edb109;
          }

          .events .event .event-data ul {
            list-style: none;
            padding: 0;
            margin: 0 0 15px 0;
            transition: all 0.4s ease;
          }

          .events .event:hover .event-data ul {
            margin-bottom: 20px;
          }

          .events .event .event-data ul li {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 500;
            transition: all 0.4s ease;
          }

          /* Hide extra info in normal state */
          .events .event .event-data ul li:not(:first-child) {
            height: 0;
            opacity: 0;
            margin-bottom: 0;
            overflow: hidden;
            visibility: hidden;
            transition: all 0.4s ease;
          }

          .events .event:hover .event-data ul li:not(:first-child) {
            height: auto;
            opacity: 1;
            margin-bottom: 12px;
            visibility: visible;
          }

          .events .event .event-data ul li img {
            width: 22px;
            height: 22px;
            filter: brightness(0) invert(1);
          }

          .events .event .contact-info {
            height: 0;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.4s ease;
            margin-bottom: 0;
            visibility: hidden;
            overflow: hidden;
          }

          .events .event:hover .contact-info {
            height: auto;
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
            margin-bottom: 40px;
          }

          .events .event .contact-info p {
            color: #fff !important;
            margin-bottom: 8px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 15px;
            font-weight: 500;
          }

          .events .event .contact-info i {
            color: #edb109;
            width: 20px;
            font-size: 20px;
            text-align: center;
          }

          .events .event .view-detail-btn {
            display: inline-block;
            padding: 18px 50px;
            background: #0d0d0d;
            color: #fff;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 16px;
            width: 500px;
            max-width: 85%;
            transition: all 0.4s ease;
            text-align: center;
            opacity: 0;
            height: 0;
            visibility: hidden;
            overflow: hidden;
            transform: translateY(20px);
          }

          .events .event:hover .view-detail-btn {
            opacity: 1;
            height: auto;
            visibility: visible;
            transform: translateY(0);
            margin-top: 10px;
          }

          .events .event .view-detail-btn:hover {
            background: #fff;
            color: #000;
          }

          @media (max-width: 1400px) {
            .events .event .event-data h4 a {
              font-size: 26px;
              line-height: 1.2;
            }
            .events .event .event-data {
              padding: 25px;
            }
          }

          @media (max-width: 1024px) {
            .events .event {
              height: 480px;
            }
            .events .event .event-data {
              padding: 20px;
            }
            .events .event .event-data h4 a {
              font-size: 24px;
            }
            .events .event .event-data ul li,
            .events .event .contact-info p {
              font-size: 16px;
            }
          }

          @media (max-width: 767px) {
            .events .event {
              height: 500px;
            }
          }

          @media (max-width: 600px) {
            .events .event {
              height: 450px;
            }
            .events .event .event-data h4 a {
              font-size: 22px;
              line-height: 1.2;
            }
            .events .event .view-detail-btn {
              padding: 12px 30px;
              font-size: 14px;
            }
          }

          @media (max-width: 480px) {
            .events .event {
              height: 420px;
            }
            .events .event .event-data h4 a {
              font-size: 20px;
            }
            .events .event .view-detail-btn {
              padding: 10px 25px;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default EventCard;
