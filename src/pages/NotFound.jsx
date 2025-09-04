import { Link } from "react-router-dom";
import Container from "../components/Container";
import Card from "../components/Card";
import Button from "../components/Button";

export default function NotFound() {
  return (
    <Container>
      <Card className="p-8 text-center space-y-4">
        <div className="text-slate-700">Page not found.</div>
        <div className="flex justify-center">
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </Card>
    </Container>
  );
}
