/* Diagrams drawn in HTML/CSS — no image files needed. */
import type { ReactNode } from "react";

export function HookTrio() {
  return (
    <div className="trio">
      <div className="trio-item">
        <span className="sym">$</span>
        <p>
          API của mod: mọi thứ mod làm được bên ngoài mã của nó, như <code>$.ui</code>,{" "}
          <code>$.command</code>, <code>$.fs</code>, <code>$.process</code>, <code>$.http</code>.
        </p>
      </div>
      <div className="trio-item">
        <span className="sym">e</span>
        <p>Sự kiện, dạng dữ liệu thuần. Với một lần gọi công cụ, đó là tên công cụ và các đối số.</p>
      </div>
      <div className="trio-item">
        <span className="sym">next</span>
        <p>Chuyển sự kiện cho các mod khác rồi tới hành vi của Claude Code, và trả về kết quả.</p>
      </div>
    </div>
  );
}

export function HookFlow() {
  return (
    <figure className="figure">
      <div className="flow">
        <div className="flow-top">
          <span className="pill">
            Sự kiện <code>tool.call</code>
          </span>
          <span className="arrow" aria-hidden="true">→</span>
          <span className="pill accent">
            <code>hook($, e, next)</code>
          </span>
          <span className="arrow" aria-hidden="true">→</span>
          <span className="pill">hook làm gì với next?</span>
        </div>
        <div className="flow-grid">
          <div className="flow-card">
            <span className="k">Quan sát</span>
            <h4>Để đi qua</h4>
            <code>return next(e)</code>
            <p>Ghi nhận sự kiện, mọi thứ chạy tiếp như cũ.</p>
          </div>
          <div className="flow-card">
            <span className="k">Viết lại</span>
            <h4>Thay đổi</h4>
            <code>return next({"{ ...e, … }"})</code>
            <p>Gọi next với một bản sao đã sửa của sự kiện.</p>
          </div>
          <div className="flow-card hl">
            <span className="k">Trả lời</span>
            <h4>Tự xử lý</h4>
            <code>return kếtQuả</code>
            <p>Không gọi next: công cụ không chạy, hoặc Claude Code không tự vẽ phần đó.</p>
          </div>
        </div>
      </div>
      <figcaption className="figure-cap">
        Ba kết quả của một hook, tuỳ cách nó dùng <code>next</code>.
      </figcaption>
    </figure>
  );
}

const TREE: { name: ReactNode; desc: string; hl?: boolean }[] = [
  { name: <span className="dir">my-mod/</span>, desc: "Thư mục plugin." },
  { name: <>{"├── "}<span className="dir">.claude-plugin/</span></>, desc: "" },
  { name: "│   └── plugin.json", desc: "Manifest quen thuộc: tên, phiên bản, mô tả." },
  { name: <>{"└── "}<span className="dir">hooks/</span></>, desc: "" },
  { name: "    ├── hooks.json", desc: 'Trỏ tới mã: { "modules": ["./register.ts"] }, đường dẫn tương đối so với tệp này.' },
  { name: "    └── register.ts", desc: "Hooks module. Claude Code nạp thẳng .js và .ts, không bundler, không bước build.", hl: true },
];

export function FileTree() {
  return (
    <figure className="figure">
      <div className="tree" role="list" aria-label="Cấu trúc thư mục của một mod">
        {TREE.map((row, i) => (
          <div key={i} role="listitem" className={`tree-row${row.hl ? " hl" : ""}`}>
            <span className="tree-name">{row.name}</span>
            <span className="tree-desc">{row.desc}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

const SNAPSHOT_STEPS = [
  { t: "Bắt lệnh shell", d: "Hook tool.call, chỉ với Bash và PowerShell." },
  { t: "Snapshot trước", d: "git status + kích thước, thời gian sửa của mọi đường dẫn đang đổi." },
  { t: "Lệnh chạy", d: "await next(e): lệnh chạy như bình thường.", hl: true },
  { t: "Snapshot sau", d: "Chụp lại lần hai. Đường dẫn khác nhau là thứ lệnh đã đổi, kể cả xoá." },
  { t: "Gửi về app", d: "POST tới app desktop AgentsRoom qua endpoint HTTP cục bộ." },
];

export function SnapshotSteps() {
  return (
    <figure className="figure">
      <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {SNAPSHOT_STEPS.map((s, i) => (
          <li key={s.t} className={`step${s.hl ? " hl" : ""}`}>
            <span className="num">{i + 1}</span>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
      <figcaption className="figure-cap">
        Cách mod <code>agentsroom-changes</code> biết một lệnh shell đã sửa tệp nào. Lệnh mà Claude Code đánh dấu chỉ đọc
        thì không nhận thay đổi nào.
      </figcaption>
    </figure>
  );
}
