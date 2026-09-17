import type {
  ResumeData,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeProjectItem,
} from "@/lib/resume/types";

/**
 * Jake's Resume one-pager: single column, Times-style serif, tight spacing,
 * bolded employers/projects with right-aligned dates, ATS-safe (no columns,
 * no icons, no color-dependence). Print-optimized for A4/Letter.
 */

function Row({
  left,
  right,
  bold = false,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="resume-row flex items-baseline justify-between gap-3">
      <span className={bold ? "resume-bold" : undefined}>{left}</span>
      {right != null && right !== "" && (
        <span className="resume-dates">{right}</span>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="resume-section-title">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

export function ResumeOnePager({ data }: { data: ResumeData }) {
  const { header, education, experience, projects, skills } = data;
  const hasSkills =
    skills.languages || skills.frameworks || skills.tools || skills.coursework;

  const contacts = [header.email, header.phone, header.location].filter(Boolean);
  const links = [header.linkedin, header.github, header.website].filter(Boolean);

  return (
    <div className="resume-page" aria-label="Resume preview">
      {/* Header */}
      <header className="resume-header">
        <h1 className="resume-name">{header.name || "Your Name"}</h1>
        {header.headline && <p className="resume-headline">{header.headline}</p>}
        <p className="resume-contact">
          {[...contacts, ...links].join("  •  ") || "email • phone • links"}
        </p>
      </header>

      {/* Education */}
      {education.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Education</SectionTitle>
          {education.map((e: ResumeEducationItem) => (
            <div key={e.id} className="resume-entry">
              <Row
                bold
                left={e.school || "Institution"}
                right={[e.start, e.end].filter(Boolean).join(" – ")}
              />
              <Row left={e.degree} right={e.grade} />
            </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Experience</SectionTitle>
          {experience.map((x: ResumeExperienceItem) => (
            <div key={x.id} className="resume-entry">
              <Row
                bold
                left={`${x.role}${x.company ? `, ${x.company}` : ""}`}
                right={[x.start, x.end].filter(Boolean).join(" – ")}
              />
              {x.location && <Row left={x.location} />}
              <Bullets items={x.bullets} />
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="resume-section">
          <SectionTitle>Projects</SectionTitle>
          {projects.map((p: ResumeProjectItem) => (
            <div key={p.id} className="resume-entry">
              <Row
                bold
                left={
                  <>
                    {p.name || "Project"}
                    {p.tech && <span className="resume-tech"> — {p.tech}</span>}
                  </>
                }
                right={p.link}
              />
              <Bullets items={p.bullets} />
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {hasSkills && (
        <section className="resume-section">
          <SectionTitle>Technical Skills</SectionTitle>
          <div className="resume-skills">
            {skills.languages && (
              <Row bold left="Languages:" right={undefined} />
            )}
            {skills.languages && <p className="resume-skill-line">{skills.languages}</p>}
            {skills.frameworks && (
              <>
                <p className="resume-skill-label">Frameworks:</p>
                <p className="resume-skill-line">{skills.frameworks}</p>
              </>
            )}
            {skills.tools && (
              <>
                <p className="resume-skill-label">Tools:</p>
                <p className="resume-skill-line">{skills.tools}</p>
              </>
            )}
            {skills.coursework && (
              <>
                <p className="resume-skill-label">Coursework:</p>
                <p className="resume-skill-line">{skills.coursework}</p>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
