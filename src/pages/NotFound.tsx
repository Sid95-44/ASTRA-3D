import { Link } from "wouter";
import { AstraMark } from "@/components/AstraMark";

export default function NotFound() {
  return (
    <div className="page failure">
      <div className="failure-card is-quiet">
        <AstraMark size={30} />
        <h1>There's nothing at this address.</h1>
        <p>
          ASTRA only has two rooms: the field brief that explains the model, and
          the simulation itself. This URL is neither — most likely a typo, or a
          link to something I haven't built yet.
        </p>
        <div className="failure-actions">
          <Link href="/simulate" className="btn is-primary">
            Open the model
          </Link>
          <Link href="/" className="btn">
            Read the story
          </Link>
        </div>
      </div>
    </div>
  );
}
