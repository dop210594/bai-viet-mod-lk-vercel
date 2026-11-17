import CodeBlock from "@/components/CodeBlock";
import { FileTree, HookFlow, HookTrio, SnapshotSteps } from "@/components/Diagrams";
import ReadingProgress from "@/components/ReadingProgress";
import ThemeToggle from "@/components/ThemeToggle";
import Toc, { type TocItem } from "@/components/Toc";
import { SITE, siteUrl } from "@/lib/site";

const SECTIONS: TocItem[] = [
  { id: "mod-la-gi", title: "Mod là gì" },
  { id: "chon-cong-cu", title: "Mod, hook settings, skill hay MCP" },
  { id: "ba-tep", title: "Ba tệp của một mod" },
  { id: "mod-cai-san", title: "Mod chúng tôi cài sẵn" },
  { id: "bai-hoc", title: "Những gì chúng tôi rút ra" },
  { id: "tu-viet", title: "Tự viết mod của bạn" },
  { id: "doc-mod", title: "Những mod bạn có thể đọc ngay" },
  { id: "an-toan", title: "Trước khi cài mod của người khác" },
  { id: "noi-chay", title: "Mod chạy ở đâu" },
  { id: "trong-agentsroom", title: "Trong AgentsRoom" },
  { id: "faq", title: "Câu hỏi thường gặp" },
];

const HOOK_CODE = `
import type { Register } from 'claude-code';

const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);

export const register: Register = (on) => {
  on('tool.call', async ($, e, next) => {
    if (!SHELL_TOOLS.has(e.tool)) return next(e);
    const ready = await prepare($).catch(() => null); // agent id, repo root, snapshot
    if (!ready) return next(e);                        // outside AgentsRoom: do nothing
    const callId = e.tool_use_id;
    post($, ready.agentId, { kind: 'start', callId });
    const ran = await next(e);                         // the command runs here
    const wroteNothing = ran.deny !== undefined || ran.isReadOnly === true;
    await reportEnd($, { ...ready, callId }, wroteNothing)
      .catch(() => post($, ready.agentId, { kind: 'end', callId, paths: [] }));
    return ran;                                        // Claude sees the normal result
  });
};
`;

const CLI_CODE = `
claude --plugin-dir ./my-mod       # load it for one session, hot reload on save
claude plugin validate ./my-mod    # what Claude Code reads from it, without running it
claude plugin test                 # run the mod's *.test.ts files, no session needed
`;

const FAQ: { q: string; a: string }[] = [
  {
    q: "Mod trong Claude Code là gì?",
    a: "Mod là một plugin Claude Code chứa một hooks module: một tệp JavaScript hoặc TypeScript mà Claude Code gọi các hàm của nó từ bên trong tiến trình của chính mình khi có chuyện gì đó xảy ra, chẳng hạn một lần gọi công cụ, một prompt được gửi đi hay một phần màn hình đang được vẽ. Mỗi hàm có thể để sự kiện đi qua, thay đổi nó, hoặc tự mình xử lý nó. Đó là điều cho phép một mod vẽ một bảng, thêm một lệnh hoặc giữ lại một lệnh shell rủi ro.",
  },
  {
    q: "Cần phiên bản Claude Code nào để dùng mod?",
    a: "Claude Code 2.1.287 trở lên trong terminal, phát hành ngày 1 tháng 10 năm 2026, với changelog ghi \"Added Claude Mods\". Tab Code của ứng dụng Claude Desktop hỗ trợ mod từ 2.1.286. Trong extension VS Code, các hook vẫn chạy, còn những gì mod vẽ ra cần extension 2.1.299 trở lên. Chạy claude --version để kiểm tra.",
  },
  {
    q: "Mod khác hook của Claude Code ở điểm nào?",
    a: "Một hook trong settings.json chạy một lệnh shell, một yêu cầu HTTP hoặc một prompt khi một sự kiện xảy ra, bên ngoài Claude Code. Các hook của một mod là những hàm chạy bên trong Claude Code. Chúng làm được những việc mà một hook settings không làm được: vẽ trong giao diện, thêm một lệnh slash chạy mà không cần một lượt của Claude, viết lại một lần gọi công cụ hoặc trả lời nó mà không chạy công cụ, và chia sẻ trạng thái giữa các hook.",
  },
  {
    q: "Cài mod của Claude Code có an toàn không?",
    a: "Một mod không chạy trong sandbox. Nó chạy với quyền của bạn, có thể đọc tệp và biến môi trường của bạn, khởi chạy chương trình, gửi yêu cầu mạng và phê duyệt một lần gọi công cụ. Chỉ cài mod từ những tác giả bạn tin tưởng, và chạy claude plugin validate trên thư mục trước: lệnh này liệt kê các sự kiện mà mod gắn hook và các lời gọi nó thực hiện, mà không chạy mod.",
  },
  {
    q: "Tìm ví dụ về mod của Claude Code ở đâu?",
    a: "Anthropic công bố mã nguồn của một số mod tích hợp sẵn, như bảng /diff và trình nạp AGENTS.md, trong thư mục mods của repository anthropics/claude-code, và các mod mẫu trong repository anthropics/claude-code-playground. Mod của AgentsRoom được mô tả trong bài này là kiểu ví dụ thứ tư: một mod không có giao diện, chỉ có một hook tool.call.",
  },
  {
    q: "Có tắt được mod không?",
    a: "Có. Tắt một mod trong tab Installed của /plugin, khởi động một phiên duy nhất với --safe-mode, hoặc đặt disableAllHooks thành true trong ~/.claude/settings.json để dừng mọi mod bạn đã cài, cùng với các hook settings của bạn. --safe-mode và disableAllHooks vẫn để các mod tích hợp sẵn chạy: những mod này được tắt từng cái một trong /plugin.",
  },
];

function Yes({ children = "Có" }: { children?: React.ReactNode }) {
  return <span className="badge yes">{children}</span>;
}
function No({ children = "Không" }: { children?: React.ReactNode }) {
  return <span className="badge no">{children}</span>;
}

export default function Page() {
  const url = siteUrl();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: SITE.title,
      description: SITE.description,
      datePublished: SITE.published,
      inLanguage: "vi",
      url,
      image: `${url}/opengraph-image`,
      author: { "@type": "Organization", name: SITE.brand, url: SITE.brandUrl },
      publisher: { "@type": "Organization", name: SITE.brand, url: SITE.brandUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ReadingProgress />
      <Toc items={SECTIONS} />
      <ThemeToggle />

      <main className="page">
        <header className="hero">
          <p className="eyebrow">Claude Code · {SITE.brand}</p>
          <h1>
            Mod của Claude Code: chúng là gì, và <span className="accent">mod chúng tôi cài sẵn</span> cho mọi agent
          </h1>
          <p className="lede">
            Mod là một plugin có JavaScript chạy bên trong Claude Code. Nó làm được gì, ba tệp của nó, cách nạp và kiểm
            thử một mod, và mod chúng tôi cài sẵn trong mọi agent.
          </p>
          <div className="meta">
            <time dateTime={SITE.published}>{SITE.publishedLabel}</time>
            <span className="dot" aria-hidden="true" />
            <span>Claude Code 2.1.318</span>
            <span className="dot" aria-hidden="true" />
            <span>Đọc khoảng 9 phút</span>
          </div>
        </header>

        <hr className="divider" />

        <article className="prose">
          <section style={{ paddingTop: 40 }}>
            <p>
              Ngày 1 tháng 10 năm 2026, Claude Code 2.1.287 ra mắt với một dòng changelog duy nhất:{" "}
              <em>&ldquo;Added Claude Mods&rdquo;</em>. Bốn ngày sau, AgentsRoom bắt đầu nạp một mod của chúng tôi vào các
              agent Claude mà nó chạy.
            </p>
            <p>
              Bài viết này giải thích mod là gì, nó làm được gì mà các điểm mở rộng cũ không làm được, cách viết, nạp và
              kiểm thử một mod, và những gì chúng tôi rút ra khi đưa một mod vào mọi agent Claude mà AgentsRoom khởi
              động. Các thông tin về Claude Code lấy từ tài liệu và changelog của nó, đọc ngày 9 tháng 11 năm 2026, với
              Claude Code 2.1.318 đã cài.
            </p>
            <div className="callout">
              <span className="callout-label">Câu trả lời ngắn</span>
              <p>
                Mod là một plugin Claude Code có một <strong>hooks module</strong>: một tệp JavaScript hoặc TypeScript mà
                Claude Code gọi các hàm của nó từ bên trong tiến trình của chính mình khi một sự kiện xảy ra. Một hàm có
                thể để sự kiện đi qua, thay đổi nó, hoặc trả lời nó thay cho Claude Code. Đó là cách một mod vẽ một bảng,
                thêm một lệnh, hoặc chặn một lệnh shell trước khi nó chạy.
              </p>
            </div>
          </section>

          <section id="mod-la-gi" aria-labelledby="h-mod-la-gi">
            <h2 id="h-mod-la-gi">Mod là gì</h2>
            <p>
              Claude Code vốn đã có plugin: một thư mục với tệp manifest ở <code>.claude-plugin/plugin.json</code>, gói
              các skill, subagent, hook settings và máy chủ MCP lại để chúng được cài như một khối. Mod là thêm một thứ
              nữa mà plugin có thể chứa. Khi tệp <code>hooks/hooks.json</code> của plugin chỉ định một tệp mã dưới khóa{" "}
              <code>modules</code>, Claude Code nạp tệp đó và gọi hàm <code>register</code> mà tệp đó export. Lúc này
              plugin được gọi là một mod.
            </p>
            <p>
              Bên trong <code>register</code>, mỗi lời gọi <code>on(event, hook)</code> gắn một hàm vào một sự kiện:{" "}
              <code>tool.call</code> trước khi một công cụ chạy, <code>prompt.submit</code> khi bạn gửi một prompt,{" "}
              <code>session.start</code>, <code>command.run</code> cho một lệnh slash, <code>ui.render</code> khi Claude
              Code vẽ một phần màn hình của nó, và nhiều sự kiện khác. Mỗi hook nhận ba thứ:
            </p>
            <HookTrio />
            <p>
              Việc hook làm gì với <code>next</code> quyết định chuyện gì xảy ra. Trả về <code>next(e)</code> nghĩa là
              bạn chỉ quan sát. Gọi <code>next</code> với một bản sao đã sửa của <code>e</code> nghĩa là bạn đã viết lại
              sự kiện. Trả về kết quả của riêng bạn mà không gọi <code>next</code> nghĩa là bạn đã trả lời nó: công cụ
              không bao giờ chạy, hoặc Claude Code không bao giờ tự vẽ phần đó.
            </p>
            <HookFlow />
            <p className="note">
              Tài liệu cũng gọi các hàm này là hook. Chúng không phải là các hook bạn viết trong{" "}
              <code>settings.json</code>, thứ mà giờ đây Claude Code gọi là <em>settings hooks</em>.
            </p>
          </section>

          <section id="chon-cong-cu" aria-labelledby="h-chon-cong-cu">
            <h2 id="h-chon-cong-cu">Mod, hook settings, skill hay máy chủ MCP</h2>
            <p>
              Bốn thứ này chồng lấn nhau, và mod là thứ nặng nhất. Hãy chọn thứ nhẹ nhất làm được việc.
            </p>
            <div className="table-wrap stack-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Bạn muốn</th>
                    <th scope="col">Dùng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="Bạn muốn" style={{ fontWeight: 400 }}>
                      Đưa cho Claude những chỉ dẫn mà bạn cứ phải dán lại vào khung chat
                    </td>
                    <td data-label="Dùng">
                      <span className="badge accent">Skill</span> <code>SKILL.md</code>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Bạn muốn" style={{ fontWeight: 400 }}>
                      Cho Claude những công cụ chạm tới một hệ thống bên ngoài
                    </td>
                    <td data-label="Dùng">
                      <span className="badge accent">Máy chủ MCP</span>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Bạn muốn" style={{ fontWeight: 400 }}>
                      Chặn, cho phép hoặc ghi log một sự kiện bằng một script bạn đã có
                    </td>
                    <td data-label="Dùng">
                      <span className="badge accent">Hook settings</span>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Bạn muốn" style={{ fontWeight: 400 }}>
                      Vẽ một bảng hoặc một dải phía trên prompt, thêm một lệnh chạy mà không cần một lượt của Claude, viết
                      lại hoặc trả lời một lần gọi công cụ, giữ trạng thái giữa các sự kiện
                    </td>
                    <td data-label="Dùng">
                      <span className="badge accent">Mod</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Một plugin có thể chứa cả bốn, nên một mod có thể đi kèm ngay cạnh skill và máy chủ MCP mà nó làm việc
              cùng.
            </p>
          </section>

          <section id="ba-tep" aria-labelledby="h-ba-tep">
            <h2 id="h-ba-tep">Ba tệp của một mod</h2>
            <FileTree />
            <p>
              <code>plugin.json</code> là manifest plugin quen thuộc: một cái tên, một phiên bản, một mô tả.{" "}
              <code>hooks.json</code> trỏ tới mã, <code>{'{ "modules": ["./register.ts"] }'}</code>, một đường dẫn duy
              nhất, tương đối so với tệp đó. <code>register.ts</code> là hooks module. Claude Code nạp trực tiếp{" "}
              <code>.js</code> và <code>.ts</code>, không cần bundler và không có bước build, và import trần duy nhất được
              phép là <code>claude-code</code>, dành cho kiểu dữ liệu và vài tiện ích.
            </p>
          </section>

          <section id="mod-cai-san" aria-labelledby="h-mod-cai-san">
            <h2 id="h-mod-cai-san">Mod chúng tôi cài sẵn: ai đã sửa tệp này?</h2>
            <p>
              AgentsRoom chạy nhiều agent viết code trên cùng một repository và cho thấy, trong tab Thay đổi của nó, agent
              nào đã sửa tệp nào, để bạn có thể rà soát và commit công việc của từng agent riêng rẽ. Các tệp được ghi bằng
              công cụ Edit và Write của Claude thì dễ: Claude Code báo cáo chúng qua một hook settings. Các tệp được ghi
              bởi một lệnh shell thì không. Một <code>sed -i</code>, một heredoc, một codemod hay một <code>rm</code>{" "}
              không bao giờ đi qua công cụ tệp.
            </p>
            <p>
              Trước khi có mod, chúng tôi phải đoán. AgentsRoom đọc transcript phiên của agent để biết mỗi lệnh Bash bắt
              đầu và kết thúc khi nào, rồi đối chiếu thời gian sửa đổi của tệp với các khoảng thời gian đó. Cách này đúng
              phần lớn thời gian, và hỏng theo ba kiểu mà chúng tôi gọi tên được:
            </p>
            <ul>
              <li>
                một tệp đã bị xóa thì không còn thời gian sửa đổi, nên một lần xóa không bao giờ được quy cho agent nào;
              </li>
              <li>
                một lệnh chỉ đọc như <code>grep</code> mở ra một khoảng thời gian mà trong đó agent có thể đã ghi bất cứ
                thứ gì;
              </li>
              <li>mọi thứ phụ thuộc vào định dạng transcript, thứ mà Claude Code có toàn quyền thay đổi.</li>
            </ul>
            <p>
              Mod loại bỏ việc phải đoán. Mod <code>agentsroom-changes</code> của chúng tôi gắn hook vào{" "}
              <code>tool.call</code> cho hai công cụ shell. Ngay trước khi lệnh chạy, nó chụp một snapshot của repository
              (<code>git status</code> cộng với kích thước và thời gian sửa đổi của mọi đường dẫn đang thay đổi). Ngay sau
              đó, nó chụp snapshot thứ hai. Những đường dẫn khác nhau chính là những gì lệnh đó đã thay đổi, kể cả các lần
              xóa, và mod gửi chúng tới ứng dụng desktop AgentsRoom qua một endpoint HTTP cục bộ. Một lần gọi mà chính
              Claude Code đánh dấu là chỉ đọc thì không nhận thay đổi nào về mình.
            </p>
            <SnapshotSteps />
            <p>Đây là hook, ở dạng rút gọn. Tệp đầy đủ dài 177 dòng, phần lớn là snapshot và các giới hạn của nó.</p>
            <CodeBlock code={HOOK_CODE} lang="ts" label="hooks/register.ts" />
            <p>
              Ứng dụng desktop sao chép mod vào thư mục riêng của nó và khởi động mỗi agent Claude bằng{" "}
              <code>claude --plugin-dir &lt;that folder&gt;</code>, chỉ khi Claude Code đã cài là bản 2.1.287 trở lên.
              Chúng tôi phát hành nó trong AgentsRoom 1.201.0 ngày 5 tháng 10 năm 2026.
            </p>
          </section>

          <section id="bai-hoc" aria-labelledby="h-bai-hoc">
            <h2 id="h-bai-hoc">Những gì chúng tôi rút ra khi phát hành nó</h2>
            <ol className="lessons">
              <li>
                <h3>Một mod không bao giờ được khiến người dùng mất một lần gọi công cụ</h3>
                <p>
                  Hook của chúng tôi đứng trước mọi lệnh shell mà Claude chạy. Nếu nó ném lỗi, hoặc chờ mạng, công việc
                  của Claude sẽ dừng. Mọi bước đều được bảo vệ, mỗi lần gửi tới ứng dụng desktop đều được bắn đi mà không
                  chờ phản hồi, và lần chờ duy nhất chúng tôi chấp nhận là hai snapshot <code>git status</code>, mỗi cái
                  giới hạn ở 15 giây. Một lần gửi bị mất chỉ làm mất một lần quy trách nhiệm, không bao giờ làm mất lệnh.
                </p>
              </li>
              <li>
                <h3>Không làm gì khi không ai cần đến mình</h3>
                <p>
                  Mod đọc một biến môi trường mà AgentsRoom đặt cho các agent của nó. Khi biến này không có, chẳng hạn vì
                  ai đó đã chép thư mục vào cấu hình riêng của họ, mọi hook đi thẳng tới <code>next(e)</code>.
                </p>
              </li>
              <li>
                <h3>
                  Một thư mục được nạp bằng <code>--plugin-dir</code> sẽ bị theo dõi
                </h3>
                <p>
                  Claude Code nạp lại mod khi một tệp trong thư mục đó thay đổi, và một lần nạp lại sẽ chạy{" "}
                  <code>register</code> thêm lần nữa. Điều đó quyết định cách chúng tôi cài nó: ứng dụng desktop chỉ ghi
                  một tệp của mod khi nội dung của nó thay đổi, vì một lần ghi đè mù quáng ở mỗi lần khởi động agent sẽ
                  nạp lại mod trong mọi console Claude đang mở.
                </p>
              </li>
              <li>
                <h3>Lường trước việc API thay đổi</h3>
                <p>
                  Các sự kiện và phương thức có thể thay đổi giữa các bản phát hành, và chính tài liệu cũng nói vậy. Khi
                  một mod được nạp từ <code>--plugin-dir</code>, Claude Code ghi các khai báo kiểu của phiên bản đang chạy
                  vào <code>.claude-plugin/types/</code>; chúng tôi kiểm tra kiểu dựa trên những khai báo đó, không dựa
                  trên một trang web. Và nếu một bản build không còn nạp được mod của chúng tôi, không có gì hỏng: mod không
                  bao giờ báo mình sẵn sàng, và AgentsRoom quay về phương pháp cũ dựa trên transcript.
                </p>
              </li>
            </ol>
          </section>

          <section id="tu-viet" aria-labelledby="h-tu-viet">
            <h2 id="h-tu-viet">Tự viết mod của bạn</h2>
            <p>Bạn có hai cách để bắt đầu.</p>
            <h3>Cách 1: Nhờ Claude</h3>
            <p>
              Trong một phiên Claude Code tương tác, mô tả mod bạn muốn (<em>&ldquo;hiển thị nhánh git hiện tại phía trên
              prompt&rdquo;</em>). Claude dùng một skill tích hợp sẵn, <code>plugin-authoring</code>, viết mod vào một thư
              mục dành riêng cho phiên đó, và Claude Code hỏi bạn một lần xem có bật các mod do Claude viết hay không.
              Đồng ý, và mod sẽ được nạp khi lượt kết thúc, rồi được nạp lại sau mỗi lượt có thay đổi nó.
            </p>
            <h3>Cách 2: Tự viết ba tệp</h3>
            <CodeBlock code={CLI_CODE} lang="bash" label="terminal" />
            <p>
              <code>claude plugin validate</code> in ra một dòng <code>hooks:</code> với các sự kiện mà module của bạn xử
              lý và một dòng <code>calls:</code> với mọi phương thức API của mod mà nó gọi. Nếu một sự kiện bạn định xử lý
              không có trong đó, Claude Code cũng sẽ không gọi hook đó.
            </p>
            <div className="callout">
              <span className="callout-label">Quy tắc phân tích tĩnh</span>
              <ul style={{ margin: 0 }}>
                <li>
                  Viết đầy đủ từng lời gọi: <code>$.ui.toast(...)</code>, không bao giờ <code>const ui = $.ui</code>.
                </li>
                <li>Truyền tên sự kiện dưới dạng chuỗi ký tự cố định.</li>
                <li style={{ marginBottom: 0 }}>Chỉ import các tệp của chính bạn bằng đường dẫn tương đối.</li>
              </ul>
            </div>
            <p>
              Để chia sẻ một mod, hãy đối xử với nó như đúng cái plugin mà nó là: gửi thư mục đi, hoặc đưa nó vào một
              marketplace (một repository có <code>.claude-plugin/marketplace.json</code>) để mọi người cài nó bằng{" "}
              <code>/plugin install &lt;name&gt;@&lt;marketplace&gt;</code>.
            </p>
          </section>

          <section id="doc-mod" aria-labelledby="h-doc-mod">
            <h2 id="h-doc-mod">Những mod bạn có thể đọc ngay hôm nay</h2>
            <div className="cards">
              <div className="card">
                <span className="k">Tích hợp sẵn</span>
                <h3>Trong Claude Code</h3>
                <p>
                  <code>/plugin</code> → tab Installed → mục Built-in. Có bảng <code>/diff</code> và trình nạp đọc{" "}
                  <code>AGENTS.md</code>, mã nguồn nằm trong thư mục mods của <code>anthropics/claude-code</code>. Thêm{" "}
                  <em>You should know</em>, tắt cho tới khi bạn bật.
                </p>
              </div>
              <div className="card">
                <span className="k">Mẫu của Anthropic</span>
                <h3>claude-code-playground</h3>
                <p>
                  Dự báo cửa sổ ngữ cảnh phía trên prompt, lớp bảo vệ giữ lại lệnh shell rủi ro, và lệnh{" "}
                  <code>/replay</code> đi qua từng chỉnh sửa của lượt gần nhất.
                </p>
              </div>
              <div className="card">
                <span className="k">Của chúng tôi</span>
                <h3>agentsroom-changes</h3>
                <p>
                  Không có giao diện, chỉ một hook <code>tool.call</code>. Hình mẫu tốt nếu thứ bạn cần là dữ liệu chứ
                  không phải một bảng.
                </p>
              </div>
            </div>
          </section>

          <section id="an-toan" aria-labelledby="h-an-toan">
            <h2 id="h-an-toan">Trước khi cài mod của người khác</h2>
            <div className="callout warn">
              <span className="callout-label">Mod không chạy trong sandbox</span>
              <p>
                Nó chạy với quyền của bạn: đọc và ghi tệp, đọc biến môi trường và cài đặt (kể cả khóa API), khởi chạy
                chương trình, gửi yêu cầu mạng, thấy mọi prompt và mọi lần gọi công cụ, và phê duyệt một lần gọi công cụ
                trước khi bạn được hỏi.
              </p>
            </div>
            <p>
              Nếu bạn đã bật sandbox của Claude Code, nó bao các lệnh Bash mà Claude chạy, không bao các tiến trình mà một
              mod khởi chạy.
            </p>
            <p>
              Vậy nên hãy đọc trước khi cài. Clone mod về và chạy <code>claude plugin validate</code> trên thư mục: các
              dòng <code>hooks:</code> và <code>calls:</code> cho bạn biết nó lắng nghe gì và chạm tới đâu, mà không chạy
              gì cả. Một mod chỉ vẽ một dải phía trên prompt thì không có lý do gì để gọi <code>$.http</code> hay{" "}
              <code>$.process</code>.
            </p>
            <div className="table-wrap stack-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Muốn dừng</th>
                    <th scope="col">Cách</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="Muốn dừng">Một mod</td>
                    <td data-label="Cách">
                      <code>/plugin</code> → tab Installed, tắt hoặc gỡ
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Muốn dừng">Mọi mod, một phiên</td>
                    <td data-label="Cách">
                      Khởi động với <code>--safe-mode</code>
                    </td>
                  </tr>
                  <tr>
                    <td data-label="Muốn dừng">Mọi mod, mọi phiên</td>
                    <td data-label="Cách">
                      <code>&quot;disableAllHooks&quot;: true</code> trong <code>~/.claude/settings.json</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="noi-chay" aria-labelledby="h-noi-chay">
            <h2 id="h-noi-chay">Mod chạy ở đâu</h2>
            <div className="table-wrap stack-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nơi bạn chạy Claude Code</th>
                    <th scope="col">Hook chạy</th>
                    <th scope="col">Phần mod vẽ hiển thị</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="Nơi chạy">
                      <code>claude</code> trong terminal
                    </td>
                    <td data-label="Hook chạy"><Yes /></td>
                    <td data-label="Phần mod vẽ"><Yes /></td>
                  </tr>
                  <tr>
                    <td data-label="Nơi chạy">Tab Code của Claude Desktop (không phải WSL)</td>
                    <td data-label="Hook chạy"><Yes>Có, từ 2.1.286</Yes></td>
                    <td data-label="Phần mod vẽ"><Yes /></td>
                  </tr>
                  <tr>
                    <td data-label="Nơi chạy">Extension VS Code</td>
                    <td data-label="Hook chạy"><Yes /></td>
                    <td data-label="Phần mod vẽ"><Yes>Từ 2.1.299</Yes></td>
                  </tr>
                  <tr>
                    <td data-label="Nơi chạy">
                      <code>claude -p</code> và Agent SDK
                    </td>
                    <td data-label="Hook chạy"><Yes /></td>
                    <td data-label="Phần mod vẽ"><No /></td>
                  </tr>
                  <tr>
                    <td data-label="Nơi chạy">Phiên trên cloud</td>
                    <td data-label="Hook chạy"><Yes>Có, nếu plugin tới được</Yes></td>
                    <td data-label="Phần mod vẽ"><No /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Một mod có vẽ nên kiểm tra xem nó đang chạy ở đâu và lùi về dạng văn bản ở những nơi không có gì được vẽ.
            </p>
          </section>

          <section id="trong-agentsroom" aria-labelledby="h-trong-agentsroom">
            <h2 id="h-trong-agentsroom">Trong AgentsRoom</h2>
            <p>
              Bạn không phải cài gì: từ Claude Code 2.1.287, mỗi agent Claude khởi động cùng mod này, và tab Thay đổi cho
              thấy các tệp mà từng lệnh shell của nó đã tạo, sửa hoặc xóa, ngay cạnh agent đã làm việc đó. Với một Claude
              Code cũ hơn, AgentsRoom vẫn đối chiếu các lần ghi của shell từ transcript, như trước.
            </p>
            <p>
              Cùng ý tưởng đó chạy trong các CLI khác khi có thể: oh-my-pi nhận một extension với cùng giao ước, còn các CLI
              khác vẫn đối chiếu các lần ghi của shell như trước đây. Nếu bạn muốn đi xa hơn với những gì Claude Code để lộ
              ra ở mỗi bước, hướng dẫn hook của Claude Code của chúng tôi bàn về các hook settings mà một mod đứng cạnh.
            </p>
          </section>

          <section id="faq" aria-labelledby="h-faq">
            <h2 id="h-faq">Câu hỏi thường gặp</h2>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <div className="ans">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </article>

        <footer className="footer">
          <span>
            © 2026 <a href={SITE.brandUrl}>{SITE.brand}</a>
          </span>
          <span>
            <a href={SITE.originalUrl}>Đọc bài gốc trên agentsroom.dev</a>
          </span>
        </footer>
      </main>
    </>
  );
}
