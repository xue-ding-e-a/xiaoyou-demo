# 部署说明

## 2026-10-29：GitHub Pages 已免费上线（当前发布）

网站：https://xue-ding-e-a.github.io/xiaoyou-demo/  
公开仓库：https://github.com/xue-ding-e-a/xiaoyou-demo  
成功工作流：https://github.com/xue-ding-e-a/xiaoyou-demo/actions/runs/40841879825

当前部署提交为 `b3fe736e164026cef8cd91814b1d6735eedbc051`。GitHub Actions于2026-10-29 16:24:55（Asia/Shanghai）完成首次发布，官方工作流为completed/success。本轮匿名核对47项资源：首页、兼容入口、清单、全部JS/CSS及标志的字节和SHA-256与本地site一致；35 MB楷体核对HEAD的HTTP200及完整Content-Length，未核对线上整字体哈希。构建tree为 `a388a0f0bbabb0b45ee9734b4642b474a00d2941c349b3a51e997deb3337c8d7`。本轮为HTTP和文件核验，未进行浏览器布局或逐帧动画验收。

推送main中的页面或部署配置后，`.github/workflows/deploy.yml` 自动构建、校验并更新同一网址；也可在Actions手动Run workflow。工作流采用官方checkout、configure-pages、upload-pages-artifact和deploy-pages，Python 3.12运行 `scripts/prepare-site.py`。此次发布含最新新增卡片的独立排版与折叠执行记录，使用原始完整字体。既有185项交互检查对应同一运行时代码，本轮未修改UI或业务脚本。

仓库首批仅258个审核文件。work缓存、登录材料、凭据、源视频、真实截图、ZIP及site构建产物均未提交。复用了Windows Git Credential Manager中已有的GitHub登录，令牌仅通过子进程环境内存使用，不写入项目。GitHub源码包为 `outputs/xiaoyou-demo-github.zip`，包含完整部署工作流；常规源码包和交付说明也已同步更新。工作区发布证据为 `work/github-pages-release.json` 与 `work/github-pages-http-check.json`。

以下为历史配置/发布记录，早前Netlify额度阻碍及Cloudflare未发布状态不代表当前GitHub Pages状态。


## 2026-10-29：改用 GitHub Pages 免费托管（配置已准备）

新增 `.github/workflows/deploy.yml`：推送main后，GitHub Actions使用Python 3.12运行 `scripts/prepare-site.py`，按白名单构建并核对本地资源，上传site产物，再由官方Pages Action部署。也可在Actions页面手动触发。工作流仅请求contents读取、pages写入和OIDC身份权限。

当前本地构建为249文件，58,627,666字节，最大字体35,027,008字节；使用原始完整字体，无需Cloudflare兼容转换。GitHub Pages的免费方案使用公开仓库，站点为纯静态演示。仓库通过明确的文件清单纳入演示HTML/CSS/JS、所需本地资源、部署脚本及交付说明。work缓存、凭据、登录材料、源视频、真实页面截图、ZIP与构建产物不进入Git。

本轮未修改界面或业务脚本；重新执行站点构建及250项本地引用/66张模板图片核对。既有185项交互检查对应当前同一份运行时代码，不代表GitHub线上或浏览器视觉验收。GitHub账户登录、仓库创建、Pages启用和线上状态将以实际发布结果更新，当前仅配置完成。


## 2026-10-29：Cloudflare Pages 免费托管兼容包

用户要求使用免费平台，当前推荐Cloudflare Pages Direct Upload。独立上传包为 `xiaoyou-demo-cloudflare.zip`，操作说明见同目录 `CLOUDFLARE-DEPLOY.md`（源码ZIP内的说明亦见本节）。登录 https://dash.cloudflare.com/ 后进入Workers & Pages，创建Pages项目，选择Drag and drop / Upload assets，上传ZIP并Deploy site；以后在同一项目创建新部署更新。

本包含249个文件，根入口index.html。字体ChillKai由35,027,008字节TTF无损封装为19,047,836字节WOFF，保留全部字体表与字形，只有字体CSS引用和资源清单随之更新。全部资源满足控制台1000文件/单文件25 MiB限制。16个字体表逐字节核验（head仅归一化容器校验和），ZIP全部成员与生成内容字节核对通过。HTML和业务JS保持最新主版本。原site/及Netlify站点ZIP未替换。当前185项交互检查属于主版本；本兼容包额外进行了字体、入口、资源大小和ZIP核验，未进行浏览器视觉验收。

尚未登录Cloudflare、创建项目或发布，没有新线上地址。需要账户登录后才能部署。官方依据为 https://developers.cloudflare.com/pages/get-started/direct-upload/ 和 https://developers.cloudflare.com/pages/platform/limits/ 。可使用 `python scripts/package-cloudflare.py` 从已构建site生成新包，当前报告为工作区 `work/cloudflare-package-check.json`。


## 2026-10-29：新增卡片独立排版与执行记录收纳（最新本地版，尚未上线）

按照最新要求，本轮为新增卡片建立独立视觉层级：主标题18px/26px、分节14px/22px、正文13px/22px、辅助12px/18px；16px圆角、20px内边距，使用8/12/16/20/24px留白节奏。画像采用标签与内容对齐，推荐方向改为分隔行，JD采用职责/要求/对齐重点/证据时间线，精筛统一身份/评分/依据布局，材料采用等宽双状态，网申字段在窄栏中上下排列。右结果窗口、表单和面试报告同步统一阅读节奏。

工作流保留当前阶段与进度，详细步骤收进默认折叠的“执行记录”；展开后保留阶段结果、工具信息与查看入口。新增内容隔离普通Agent消息的段落与列表边距。动画保持逐项出现、扫描、数字增长、半环评分和完成勾选，并补齐停止/冻结/减少动态效果时的扫描伪元素保护。

四个主题、左Agent/右真实简历与结果窗口、四页建议、确认后逐条普通正文改写、排队与立即引导、手机紧凑执行规则继续保留。没有连接官网API、真实Agent、实际招聘平台或真实提交。

当前12组185项检查通过，报告索引为工作区的 `work/product-layout-validation-summary.json`。检查范围是内存DOM、模拟计时和动画请求、CSS解析及本地资源；**没有浏览器布局、字体栅格、逐帧动效或全部交互状态的视觉验收**。未读取本地file、localhost、CDP或官网私有账户。

本轮正式同步原Netlify站点，官方返回HTTP403：`Account credit usage exceeded - new deploys are blocked until credits are added`。没有新部署或文件上传，线上仍为 `6ae2b70997390ffd05c9ad0a`；**本次排版优化尚未上线**。发布证据为 `work/product-layout-deploy.json`。本地HTML、依赖、站点ZIP、源码ZIP和说明已更新。

以下是历史版本记录；旧截图、旧样式及旧验证不代表本轮结果。

站点ZIP：249文件，40680043字节，SHA-256 `ffd46b3fca76bb34a823f68109697982a94fe044f5229cf6920ecb9ff1f8b031`。构建tree `a388a0f0bbabb0b45ee9734b4642b474a00d2941c349b3a51e997deb3337c8d7`。核对250项引用与66张模板图片。原CSS的未用会员弹窗远程背景仍单独记录。见 `work/product-layout-build.json`；最终包逐项核对见 `work/product-layout-package-verification.json`。

额度恢复后可运行既有命令：`python scripts/netlify-digest-release.py --report work/product-layout-retry-deploy.json --title Product-card-layout`，成功后核对新部署状态和匿名资源。当前未改套餐、凭据或站点配置。


## 2026-10-29：官网制式显示优化（最新本地版，发布仍被额度阻止）

本轮重读公开前端组件与CSS变量后调整六份CSS：统一10px白/浅灰卡面、细边框、14–16px标题/13–14px正文/12px辅助；减少强渐变和大阴影，保留扫描、错峰、半环/计数与完成动效，并改善窄列长文/材料/字段。右结果窗口、网申及面试同步采用较轻的标题、按钮和表单层级。业务JS、唯一真实A4与既有交互未修改。

当前11组182项检查通过；报告索引 `work/style-validation-summary.json`。这是本轮内存DOM/模拟时钟/动画调用/CSS资源检查，**不包含浏览器布局、逐帧视觉或全部hover/focus验收**。未读取本地file、localhost、CDP或官网私有账户。详细源码、状态及尺寸记录为 `work/official-style-refinement-audit.md`。

最终站点ZIP为248文件、40,678,185字节，SHA-256 `e76e6a023b9b5fb9394308151446a9fdb37a9c0feb870e75aa2623f652d59628`；构建tree `febd5ed81049587a0f81ae4fb9275e5bdebf156e9aa4397d38bc575d102d3d44`。构建核对248项引用及66张模板图片；会员弹窗未用到的官网远程CSS背景规则仍单独记录。构建为 `work/style-refinement-build.json`，两个交付包的最终字节核对为 `work/style-package-verification.json`。

正式向原站点尝试摘要发布，Netlify返回HTTP403：`Account credit usage exceeded - new deploys are blocked until credits are added`。没有新deploy ID或文件上传；线上仍为 `6ae2b70997390ffd05c9ad0a`，**本次显示优化尚未上线**。证据为 `work/style-refinement-deploy.json`。未改套餐、权限、凭据或站点配置。额度恢复后可执行 `python scripts/netlify-digest-release.py --report work/style-refinement-retry-deploy.json --title Official-style-refinement`，随后对新deploy ID做官方status及匿名资源核对。

以下为历史版本记录，旧包、旧截图与旧验证不代表本次显示优化。

## 2026-10-29：全部卡片对话动效融合（本地完成，未上线）

四张卡片全部改为左Agent累计动画产物、右原简历和结果标签页。画像字段错峰、读取扫描、方向环、来源数字、经历完成节点、精筛半环评分、双材料状态与网申字段来源均已接入对话。停止、历史冻结、逐字更新节点稳定和减少动态效果保护已补齐。初始保留真实A4；完成延迟500ms切结果，主动关闭或选择简历后不抢回。精筛隐藏A4副本及投递假纸张已去除。面试在左准备后直接进入第一题。

本次通过官方摘要发布API尝试同步原站点，返回HTTP403：`Account credit usage exceeded - new deploys are blocked until credits are added`。**没有新部署或文件上传，本版尚未上线**，生产仍为 `6ae2b70997390ffd05c9ad0a`。当前证据为 `work/all-cards-deploy.json`。没有修改套餐、凭据、权限或站点配置，也未创建替代站点。

最终站点ZIP包含248文件，40,675,244字节；SHA-256为 `888db17015847525f4294306316239f52cfde71778f872a5df3eb1b4bdc6596e`。候选构建tree为 `2395c101f304b6a91b404b84752dce91d3e1c1605d40add91a91f7802d972159`，与发布报告一致。构建核对本地引用248项、模板图片66项；另保留官网CSS中未使用会员弹窗的远程背景规则，工作区检查确认当前DOM不匹配这些规则。构建结果及完整ZIP逐项字节核对见 `work/all-cards-build.json`。

本轮11组共182项检查通过：四页建议15、真实改写19、工作区23、校园分栏20、校园动效10、改简历产物7、其余产物8、分栏集成17、职业业务21、场景host24、生命周期18。当前报告索引为 `work/all-cards-validation-summary.json`；涉及停止/旧回调、队列和即时引导、唯一A4、结果500ms/关闭/手动恢复、筛选门槛、材料与网申来源、八题面试/报告/重练。**这些仅为内存DOM、模拟计时、动画请求及CSS/资源检查，不包含本版浏览器布局或逐帧动画验收**。当前工具无浏览器控制入口，且项目禁止本地file、localhost或CDP绕过；未继续官网认证或读取真实账户。

`outputs/xiaoyou-demo.html`、同目录依赖、四份交付说明和两个ZIP包含最新版本。源码ZIP不包含work审计缓存、截图、二维码或账户材料。额度恢复后可执行下列既有发布命令，再对新deploy ID做官方status和匿名资源核对：

```powershell
python scripts/netlify-digest-release.py --report work/all-cards-retry-deploy.json --title All-cards-Agent-split-motion
```

以下为历史发布和验证记录，旧舞台/抽屉布局和旧截图不代表当前本地版。

## 2026-10-29：校招推荐恢复左右分栏（本地完成，发布被额度阻止）

已完成“找适合我的职位”左Agent/右原简历与推荐窗口，左对话累计用户画像、推荐方向和站内整理过程，右侧区分校招项目/批次与相关职位。官网入口提示词、项目建议与窗口依据见 `work/campus-recommendation-source-audit.md`；本地四阶段和动效是用户要求的组合，不代表官网后台固定次序。

本轮正式尝试同步原站点。Netlify官方文件摘要API于2026-10-29返回HTTP403：`Account credit usage exceeded - new deploys are blocked until credits are added`。没有新部署ID或新文件上传。原生产仍为 `6ae2b70997390ffd05c9ad0a`；本地最新实现尚未上线。证据为 `work/campus-split-deploy.json`，被拒候选构建tree为 `ea49ae21b26afcf1095dd7ea0ca5ae43268777c3ac1d7e5b78f06b031434e271`。随后本地补齐按方向/已有SQL技能选择相关站内职位；最终构建以 `work/campus-split-build.json` 为准。

未改套餐、凭据、权限或站点配置。额度解决后可执行 `python scripts/netlify-digest-release.py --report work/campus-split-retry-deploy.json --title Campus-recommendation-split-workspace`，成功后再按新部署ID做官方status和匿名HTTP核对。

本轮campus20、career21、场景host23、stage12、卡片15、编辑19、工作区23项共133项通过，属于内存DOM、模拟计时和局部CSS检查。测试读取当前HTML依赖，验证校招引用、真实唯一A4、停止/旧回调、队列与引导、页面与待投衔接及移动规则。**本轮没有浏览器布局或逐帧视觉验收**：发布被拒，项目约定禁止读取本地file或借localhost绕过。旧截图和HTTP结果仅属于对应历史部署。

## 2026-10-29：多来源粗筛与独立精筛

主体已发布到原 Demo，生产部署 `6ae2b70997390ffd05c9ad0a`，11:01:32（Asia/Shanghai）上线；官方API确认ready/currently_published。全网粗筛显示BOSS直聘、站内资源、网页搜索、企业官网，汇总48个虚构职位，不计算岗位匹配度。批量筛选沿用完整粗筛池，支持城市、方向、招聘类型、月薪下限、行业、最低匹配度，默认80分时保留9个达标结果并按分数排序；低分不列出。提高90分得到0条，再恢复80分仍从48条原池恢复9条。四个原主题保持不变。

已发布版本的37项匿名HTTP检查全部200且字节/SHA一致（`work/netlify-career-http-check.json`）。本轮career20、scenario23、大舞台12、卡片15、编辑19、工作区23项通过；检查属于内存DOM/模拟计时。公开页面实际走通48→9→0→9并检查了展开条件面板与空结果；截图为 `work/rough-fine-match-live.png`、`rough-fine-refine-live.png`，不宣称完整移动端或逐帧动效验收。

**本地另有两项未上线的小修：粗筛完成后自动回到列表顶部、按岗位方向显示对应关键词。** 主体上线后尝试同步此补丁，Netlify官方明确返回 `Account credit usage exceeded - new deploys are blocked until credits are added`。标准完整上传与同权限增量上传均被拒绝，未修改套餐、权限或凭据。`outputs/`、`site/`、最新源码ZIP/站点ZIP包含该本地补丁，因此目前不与线上完全相同；最后补丁重新通过career20项。补丁构建为 `work/rough-fine-build.json`，发布阻碍为 `work/rough-fine-deploy.json`。额度恢复后可用 `python scripts/netlify-digest-release.py` 上传已验证的site，再运行官方status与匿名校验。

本轮重读官网JobCard/SkillTags缓存；官网当前登录会话失效，跳到认证页面，未继续认证，因此不声称新取得登录后官网DOM/计算样式。来源与职位全部虚构，没有调用实际招聘平台。

## 历史发布：视频工作台重排与面试界面（2026-10-29凌晨）

完整静态站点已通过 Netlify 官方 API 发布，生产部署为 `6ae22be9b3fe3e3042ab7ef9`，沿用 [线上 Demo](https://glistening-pastelito-4aac42.netlify.app/)。本轮重新执行官方状态查询，`work/video-rework-deploy.json` 显示 `state: ready`、`currently_published: true`、无部署错误，发布时间为2026-10-29 01:07:59（Asia/Shanghai）。本轮采用完整 `site/` 资源，不以轻量共享资源包作为当前发布依据。

本次发布包含工作台阶段布局 `xiaoyou-stage.js/css`、面试界面 `xiaoyou-interview.js/css` 及当前工作区、职位和四主题工作流脚本。前一修正版已处理搜索可视区、建议抽屉定位、看板菜单遮挡与重复投递状态；本次进一步适配画像高度与快照等比缩放，让建议内容内部滚动并保留翻页按钮，排版工具条改为按需显示，非工具状态隐藏无效横向滚动条。PDF决定主题内容，视频决定卡片后的交互；这些是已发布实现，实际视觉范围另列下文。

2026-10-29 01:09（Asia/Shanghai）完成匿名HTTP核验：从当前 `site/asset-manifest.json` 自动枚举全部34个JS/CSS文件，并与本地实际文件集合核对；加上首页、兼容入口和清单，共37项全部返回200，字节数及SHA-256均与当前构建相同。范围包含stage、interview、workspace及所有其他脚本、样式和字体样式表；没有下载字体文件、图片，也没有访问Cookie、凭据或账户接口。6项临时传输错误在有限重试后成功，记录保留尝试次数；官方状态查询首次临时TLS错误，第二次成功。未发现资源内容不一致。

复核命令与记录：

```powershell
python scripts/netlify-release.py status --deploy-id 6ae22be9b3fe3e3042ab7ef9
python work/check-public-career-http.py --deploy-id 6ae22be9b3fe3e3042ab7ef9
```

报告为 `work/netlify-career-http-check.json`。匿名检查脚本根据发布清单自动扩展JS/CSS范围，遇到传输错误有限重试；它不调用账号接口。部署身份由独立的官方状态查询核实，使用既有Netlify认证且不输出凭据。

线上清单树SHA-256：`1dde211600712fbd975cda69d553d8ea1c8af9b5ce59b8d83a6fed314276ac9f`。完整发布ZIP共241个文件，解压58,458,483字节，压缩40,635,044字节，SHA-256为 `a2d3de7b75c52e3453afd3ea6e27752f4e49597c7db37efa05fd1927a5b45207`。构建元信息见 `work/video-rework-build.json`。

最后这次调整重新通过工作流12/12、大舞台12/12、场景23/23，共47项相关回归。此前第二修正版 `6ae225bfd3306e4bd3e548af` 曾通过上述三组及编辑19/19、四页卡片15/15，共81项；其中工作流覆盖重新准备材料时保留已面试状态。未将未重跑的编辑/卡片检查描述为最后修正版的新运行。检查属于内存DOM、模拟计时及被测状态，不代表完整视觉验收。更早大舞台基线为 `6ae21ef32a4e59d160af034d`。

公开页面已有第二修正版的73张搜索连续帧及43张看板连续帧，索引在 `work/rework-motion/`，独立逐图复核见 `work/video-review/REWORK-VISUAL-RESULT.md`。这些帧能证明画像移位中间态、方向错峰/分数增长、岗位逐项进入、搜索末态完整两卡与CTA、看板跨列中间态及落地展开；看板采样开始于卡片离开原列之后，不能证明起始标签停留、抬升或完整补位。采样也不等同60fps平滑度或精确缓动核验。

**最后修正版的指定页面实看已完成。** 1331×819下，最终画像21帧及原尺寸013/018确认四张卡约在y179–666完整可读，三个方向和下一步可见，输入不遮卡片；`work/video-rework-target-final.png`确认专业技能与底部正文完整、默认工具条不遮纸面、横向滚动条消失。`work/video-rework-suggestions-final.png`确认第1/4页标题、问题、原文及翻页按钮可见，选项内部滚动；此证据不代表四页或四个选项同时完成视觉验收。`work/video-rework-batch-final.png`确认4项均已投递、数量解释一致，重复投递禁用另由功能检查验证。`work/video-rework-interview-final.png`确认通用Agent输入已收起；最终面试13帧显示准备清单逐项完成并进入提问及题目写入中态。

独立复核累计150连续帧、19张联系表，详见 [最终视觉报告](work/video-review/REWORK-VISUAL-RESULT.md)。[最终画像动态预览](work/video-rework-motion-preview.gif)由最终序列前20帧按真实采样间隔合成、仅缩至1000px宽；它不是60fps录屏。最后画像约半秒、面试812–864ms的采样不能证明精确缓动或全部中间态。批量双状态中途、混合投递状态、完整逐字改写、看板起始抬升与补位、问答到报告全部过渡、所有hover/focus仍未完整视觉验收。390×844截图仅支持紧凑输入、停止恢复及横向看板；平台徽章在部分滚动位置遮挡表单，滚动避让未被独立操作确认，真机键盘与完整移动流程仍未验收。下方历史结果不外推为当前全部状态通过。

## 历史发布：视频驱动的四主题工作流（2026-10-28）

生产部署 `6ae1ec62f4dfe65a3884ad52` 已于2026-10-28 20:36（Asia/Shanghai）发布，沿用 https://glistening-pastelito-4aac42.netlify.app/ 。Netlify 项目 Activity 中标记为 Currently published，2项更新文件上传成功；此前18:43的完整工作流部署为 `6ae1d1b4d8c6949b7ceb8e9c`（13项新增/变更文件）。

保留四个原主题：“找适合我的职位”“针对职位改简历”“批量筛选职位”“填写网申”。流程图仅用来分配内容，视频用来确定卡片内操作、衔接和动态呈现。视频审计包含74张逐秒帧和152张0.25秒细分帧，详见 `work/video-review/VIDEO-UI-AUDIT.md`。实现画像与方向、顺序职位推荐/匹配评分、左JD与右侧同一张真实A4、逐条普通正文改写、独立简历和招呼语准备状态、确认后模拟投递、我的职位看板与面试入口。网申未出现在视频中，内部字段核对不宣称视频还原。

使用虚构简历和职位，工作流及投递是模拟；未接入真实AI、招聘平台提交、插件或消息发送。发现职位/我的职位通过本地共享状态衔接；停止、清空选择、分批投递、旧结果按钮和网申核对保留相应状态保护。

验证结果：卡片15、编辑19、工作区23、移动12、分栏尺寸11项通过，当前工作流9组与场景23组通过。属于内存DOM、模拟计时及局部CSS断言，不等同逐像素还原。原27组旧场景单列历史兼容检查，不计作当前业务验收。

最终生产版本的公开浏览器检查：

- 1331×819：原四主题可见；目标JD与A4并排，建议定位同时对应职位关键词及简历原文；文档宽度1331px，无页面横向溢出。浮动简历控件底部746.67px，Netlify角标顶部756.33px，不相交。
- 390×844：网申的9个文本输入及1个文本域计算字号均16px，输入区保持44px；文档宽度390px，无页面横向溢出。滚动到底后确认按钮底部756.68px，角标顶部781px，不相交，工作流底部预留64px。
- 此前完整工作流版本已在浏览器操作验证画像/推荐、发现职位选择进入批量筛选、4份材料就绪后模拟投递、看板3已投递+1已约面。最终补丁只修改手机字号与角标避让，12项资源哈希验证覆盖全部新增工作流文件。
- 桌面最终页面错误日志为空。手机页面重新载入时出现一条没有来源URL的 `MutationObserver.observe` 参数错误，已复现但尚未定位。源码空节点审查及390/760/1440px内存DOM观察器检查未复现，公开Netlify注入脚本也不含该调用；不能据此归因平台或宣称手机日志全无错误。已验证网申填写展示、布局及底部操作未受影响。未测试真机软键盘。

截图：`work/career-live-home-final.png`、`work/career-live-workspace-final.png`、`work/career-live-mobile-final.png`。测量和日志范围记录在 `work/career-live-final-check.json`。临时手机视口已恢复。

匿名HTTP核验首页、清单、主脚本和全部新增工作流文件共12项，均返回200，字节数及SHA-256与本地 `site/` 一致；详见 `work/netlify-career-http-check.json`。没有访问Cookie、凭据或账户接口。线上清单树哈希 `e12b71bd81e5e6d9d2eb23f184c6f1c4db2bd2b48dd736aaa1d13308e81a04cf`。

发布ZIP：237文件，解压58,356,741字节，压缩40,607,322字节，SHA-256 `f64973a9612a0481fa4de1fc25e3bb384fe54304dc576577ab59a1c233ce5f1d`。源码ZIP包含本轮更新后的说明，文件元信息见 `work/career-source-package.txt`。交付包均不包含审核截图、账号内容或工作缓存。

## 以下为历史发布记录

下文的“当前”“本轮”均指对应历史版本，不代表上面这次发布。

## 工作流文案更新（2026-10-28）

已将现有UI中的11处“组合技”统一改为“工作流”，覆盖场景入口、流程标题、完成/停止状态及执行提示；同步场景说明文档2处。原有布局和业务交互未改动。

当前生产部署：`6ae1b1cb32d8d08e8516f8c5`，继续使用原Netlify地址。场景27、卡片15、编辑19、工作区23项检查全部通过。匿名HTTP核对首页、清单、两份变更脚本，四项200且与本地一致；记录见 `work/netlify-workflow-http-check.json`。线上浏览器已确认入口“改简历工作流”“网申填写工作流”和运行标题“改简历工作流”，截图 `work/workflow-wording-live.png`。


## 本轮发布：工作台显示优化（2026-10-28）

当前源码位于 `E:\UP简历产品DEMO`，从既有 kai 项目同步后修改。当前发布为 `6ae1abe5e121dd6add46739c`，继续使用 https://glistening-pastelito-4aac42.netlify.app/ 。Netlify 的 published 链接已核实。

任务卡按聊天容器宽度在560px以下切为单列，欢迎区收紧，中文界面使用明确字体回退；结果说明提高可读性，图标化控件补齐名称。继续使用官网紫色、圆角及150ms颜色反馈。分栏保存比例并随窗口和侧栏宽度重算；默认A4按预览区适宽，显式缩放保留放大滚动。四类场景、四页建议、逐条改写和手机紧凑执行流程保留。

Netlify角标出现时，仅在≤1100px且无预览的首页预留底部88px，并将说明放在bottom68px，确保发送按钮整个点击区域避开角标。

验证：8份回归脚本共119项通过（卡片15、编辑19、编辑定位3、场景27、分析定位9、手机12、工作区23、新增分栏尺寸11），属于内存DOM/局部CSS检查。HTML资源引用和CSS解析通过。

真实浏览器观察：

- 1331×819桌面窄聊天区：四卡约66.33px高，标题均单行；简历完整适宽。
- 900px窗口、侧栏展开：预览右边界892px，滚动区client/scroll均243px，无横向溢出。
- 390×844执行中：输入44px，预览700.64px（83%），仅当前思考提示可见，简历无横向裁切；结束后建议卡恢复。
- 390/320首页：页面宽度等于视口，发送按钮底部745.33/541.33px，角标顶部781/577px，完全不相交；可见按钮均有名称。

最终匿名HTTP检查首页、清单、xiaoyou-display.css和xiaoyou-workspace.js，四项均200且与本地逐字节一致；见 `work/netlify-display-http-check.json`。首次清单请求临时网络失败后重试成功，未访问Cookie或账户凭据。

发布ZIP：228文件、40,555,256字节，SHA-256 `2dd233f12eff52e43246c0c6355d570c0154054345b85beeac06aacf289aa5b2`。

截图：`work/display-after.png`、`work/display-mobile-home.png`、`work/display-mobile-running.png`。本轮不声称所有官网状态逐像素一致，也未验证真机软键盘。旧版记录仅作为历史。


## 历史记录

## 当前状态

2026-10-28：项目已在用户明确同意后执行 **Make public**，现已公开上线，任何持链接者均可访问。站点于 2026-10-27 通过 Netlify Drop 上传；公开后匿名 HTTP 已确认首页返回 200。

- 项目：`glistening-pastelito-4aac42`
- 地址：[https://glistening-pastelito-4aac42.netlify.app/](https://glistening-pastelito-4aac42.netlify.app/)
- Project ID：`a6163cca-fe04-45c8-8e92-24e47d26e6ec`
- 当前 Deploy ID：`6ae19b5892b0faa6b97a59f9`（2026-10-28，阶段产物回查、匹配证据衔接与内部网申核对）

首次公开所需的用户确认已于 2026-10-28 完成。Netlify 界面的“仅团队可见”和 **Make public** 按钮已消失，页面重载后不再显示 Private 提示；另已通过不带 Cookie 或凭据的 HTTP 请求核验公开访问。

本方案直接上传静态文件，无需 GitHub 仓库或自备域名。未建立国内镜像，未承诺中国大陆访问速度。

## 一条命令准备发布包

在项目目录运行：

```sh
python scripts/package-site.py
```

该命令先执行 `scripts/prepare-site.py`，按白名单重建 `site/`，再生成 `outputs/xiaoyou-demo-site.zip`。ZIP 中的 `index.html` 位于根目录，没有外层 `site/` 文件夹；原来的 `xiaoyou-demo.html` 入口仍保留。`index.html` 与源入口逐字节一致。

构建校验 HTML/CSS 的本地引用和动态模板图片，生成 `site/asset-manifest.json`。打包仅包含 `site/` 已构建内容，逐一核对文件字节数、SHA-256 和 ZIP CRC，并输出压缩包大小和 SHA-256。文件顺序和 ZIP 时间固定，在相同 Python/zlib 环境中重复打包内容不变。

只准备目录时可运行：

```sh
python scripts/prepare-site.py
```

当前发布包共有 227 个文件，解压大小 58,170,901 字节；压缩包大小 40,552,820 字节，SHA-256 为 `b151d210bf362908f7459b3571acc4bab77b93c1ff703aae0fd0734c26a909b9`。清单树哈希为 `ef0dd5e35cebce88243372830d4963d20cbc5b1cfa8dd30eefa0a5df82c459f1`（不含清单文件自身）。本轮已读取本地ZIP成员信息并计算压缩包哈希，以上数据一致。Netlify面板显示当前部署已发布，上传7项变更文件。后续资源变化时以脚本实际输出为准。包内含 35,027,008 字节的字体，Drop 已成功接收完整站点；这不代表所有网络或后续上传均没有大小相关风险。

当前版本继续按用户任务组合已有工具：找职位与批量筛选共用后续流程，阶段产物、来源记录与漏斗可回查；匹配证据连接建议页和正文定位，内部网申按4组核对7字段并定位缺项。完整说明可展开，既有四页建议、逐条编辑、队列引导与手机布局继续保留。用户已撤回企业官网嵌入要求；所有内容使用虚构样本，未连接真实工具服务或账号。设计与实现范围见 `outputs/SCENARIO-DESIGN.md`。

当前部署匿名HTTP抽查首页、`asset-manifest.json`、`xiaoyou-demo.js`、`xiaoyou-scenarios.js`、`xiaoyou-scenarios.css`、`xiaoyou-resume-journey.css` 六项，均返回200，字节数及SHA-256与当前 `site/` 一致，清单树哈希也一致。记录为 `work/netlify-composition-http-check.json`，复核脚本为 `work/check-public-composition-http.py`；无Cookie或凭据，未下载大字体。

本轮新场景27/27、移动12/12、编辑19项、工作区23项、分析定位9项、编辑定位3项和卡片检查通过；停止分析计数修正后场景回归再次通过。

当前公开页面1440×900实测：找职位初始来源待搜索、漏斗禁用；完成显示5/5、工具详情默认折叠，阶段回查可定位初筛，漏斗为8/6/3/3/2/1。贡献证据进入简历第3页并唯一定位正文第2条，效果证据进入第2页并唯一定位第3条，分析后原文未修改。截图 `work/composition-live-desktop.png`、`work/composition-live-evidence.png`。

390×844内部网申运行时输入44px、预览约700.592px，页面宽390px、仅原思考提示、无外部iframe或横向溢出；指标 `work/composition-live-mobile-metrics.json`。完成后4组7字段、2缺项，缺项按钮准确聚焦；补2027-07-01和上海并勾选后只确认填写结果，仍等待手动提交，截图 `work/composition-live-mobile-form.png`。320×640完成页工作区可见/内容宽度均293px、缺项0，无横向溢出。控制台错误为空，恢复默认视口并返回公开首页。此范围不含真实插件、官网DOM、真机软键盘或所有动效；以下旧版截图另列历史。

历史四场景版 `6ae185fa0b680d00a86b1ec8`：227个文件，解压58,145,926字节，压缩40,547,002字节；ZIP SHA-256为 `77eaca6b06a64880490d5bec1f4718c3b5aab2071a704a4d68dd0fe9092c3604`，清单树为 `3b61706580cce5778d5607f8341e17564f9ca888cc55abcb5fda66d2564aa9a7`。其六项匿名HTTP记录 `work/netlify-scenarios-http-check.json` 匹配当时构建。

该历史版公开页面曾核对：四入口；找职位5阶段完成后6个示例职位，2推荐/1待核实/3不符合；推荐分类、勾选两项对比、展开原始职责/要求/证据；从云杉科技职位进入改简历后四页建议保留，证据区显示目标职位及其示例职责、要求、差距。首页截图为 `work/scenarios-live-home.png`，桌面截图为 `work/scenarios-live-desktop.png`。

该历史版390×844浏览器视口执行网申时，输入44px、右侧预览700.667px，消息区仅 `original-thinking`，无横向溢出；指标为 `work/scenarios-live-mobile-metrics.json`，截图为 `work/scenarios-live-mobile-running.png`。网申初始5项匹配/2项待补，直接确认被拦截；补入示例到岗日期2027-07-01、城市上海并勾选核对后，回执仍为等待手动提交，未发生外部提交。320×640完成表单页的页面宽320px、工作区可见/内容宽度均293px，无横向溢出，截图为 `work/scenarios-live-mobile-confirm.png`。当时浏览器控制台错误为空，检查后恢复默认视口。以上是该版公开Demo的指定流程与尺寸检查，不代表本轮新增交互、真实手机软键盘、真实业务服务或官网全页面逐像素验收。

历史手机版 `6ae16a51eeee7fd1dd4c41c1`：预览打开且宽度≤760px时输入区为44px横条，执行消息区只显示思考提示；A4纸张按滚动区宽度减左右各8px设置缩放上限。该轮语法、卡片、编辑、工作区及移动12/12通过。390×844浏览器视口曾实测聊天区135.333px、输入44px、简历区700.667px（83.0%）；纸张宽356.999px、x=16.5px、缩放约0.449792，滚动区可见/内容宽度均373px。截图与指标 `work/mobile-workspace-live.png`、`work/mobile-workspace-live-metrics.json` 仅属于该手机版历史，不能作为本轮新场景验收。

历史手机版的五项匿名HTTP记录为 `work/netlify-mobile-workspace-http-check.json`，当时匹配对应构建；该版另在320×640视口验证约300字多行草稿仍保持44px输入、聊天约135.33px，滚动区可见/内容宽度均293px，关闭预览后输入恢复84px并显示历史。排队/立即引导/停止和完成恢复也属于先前观察；不作为当前新场景或实际手机软键盘验收。

历史：手机首版 `6ae167af109aaea0515cbbe0` 已验证紧凑高度与失焦，后因发现50%纸张横向裁切而由当前适宽版本替代。更早逐条编辑高亮部署 `6ae1637db219dc4087179ff9` 的四项匿名核对在 `work/netlify-edit-paragraph-http-check.json`；准备时唯一SECTION高亮、第二条改写时唯一LI高亮、无ins/del及完成清零的公开页面观察和 `work/edit-paragraph-highlight-live.png` 保留为历史证据，不作为本轮手机布局检查。

上一版整轮模块高亮部署为 `6ae15e6eb01c25a76dcb2159`，发布包224文件、解压58,070,931字节、压缩40,525,728字节。其四项匿名HTTP检查见 `work/netlify-edit-scope-http-check.json`，保留为旧版记录，不作为本轮逐条高亮验证。

此前「先分析后定位」版本已在公开页面实际核对先无高亮、后出现项目标题高亮的顺序，三项资源匿名校验记录为 `work/netlify-analysis-intro-http-check.json`。首次公开版本的18项资源与大字体校验也保留为历史结果；本轮未重新下载未改动的35 MB字体，未将历史结果当作当前全部文件的新检查。

## Netlify 更新与分享

1. 完成本地修改及相关功能验证，再运行打包命令。
2. 登录 Netlify，打开现有项目 `glistening-pastelito-4aac42` 的 **Deploys** 页面。
3. 将新版 `outputs/xiaoyou-demo-site.zip` 或 `site/` 目录拖入该项目的上传区域，等待新部署完成。更新时使用原项目，保留 `glistening-pastelito-4aac42.netlify.app` 主站地址。
4. 核验首页、脚本、样式、字体和 `asset-manifest.json`；核对线上清单与本地产物。
5. 用未登录访问核验更新后的主站网址。当前项目已经公开，无需为同一项目的普通内容更新重复执行 **Make public**。

回滚时，在该项目部署历史中选择已验证的旧部署并恢复发布；也可重新上传保存的旧版发布包。仅回滚本地文件不会改变线上版本。

## 可选的旧工作流

仓库中保留 `.github/workflows/deploy.yml`，用于 GitHub Pages 和可选的 EdgeOne 镜像。该工作流**尚未运行，未因此创建远端仓库、Pages 站点或国内镜像**，也不是当前 Netlify 更新流程的前置条件。

以后如需要自动发布，可另行配置 GitHub 账号与仓库、Pages 的 Actions 发布源，并按工作流配置 EdgeOne 凭据、项目和 CLI 版本。国内镜像还需按所选平台的实际区域、域名与备案要求单独确认；默认境外地址不能等同于大陆节点镜像。

## 验证范围和发布内容

- 本地功能逻辑已做内存 DOM 验证；这不等同于真实浏览器布局或逐像素验收。
- 历史上线轮的浏览器已验证首页、模拟分析后的四页卡片与第 1 页到第 2 页切换；当时九份 CSS 已加载，未发现加载失败的图片。
- 2026-10-28 首次公开版本的匿名 HTTP 核验：首页、线上清单及抽查的 18 项资源均返回 200；清单与当时本地逐字节一致，18 项资源的大小与 SHA-256 全部匹配，包含 35,027,008 字节的 `ChillKai.ttf`。这是历史抽查范围的线上验证，并非当前全部 227 个文件逐项下载检查；记录位于 `work/netlify-public-http-check.json`。
- 当前部署的匿名 HTTP 核验为首页、清单、主脚本、场景脚本、场景CSS和简历过程CSS六项，均与当前构建一致，记录见 `work/netlify-composition-http-check.json`；没有使用Cookie或凭据，也未查询平台账号API，未重复下载35 MB字体。HTTP哈希验证不等同于浏览器交互或动效验证。
- 本轮新场景27/27、移动12/12及简历相关回归通过；公开页面已检查阶段回查与漏斗、证据跳页/定位及390/320px内部网申。旧16项场景与手机测量仍保留历史，不扩充为全部设备或官网全页面逐像素结论。此前官网DOM读取曾因账号/真实简历风险被自动审批拒绝；本轮未重试，风格依据公开缓存。
- 站点和发布 ZIP 排除 `work/`、登录二维码、源码 ZIP、真实页面截图与账户缓存；ZIP 本身也不进入站点。
- 资源为已有 Demo 的公共样式、字体、图标及公开模板缩略图；简历为虚构示例，未接入真实业务或模型。
- 原站 CSS 保留 11 个未使用会员弹窗的远程背景 URL，构建会报告这些引用；不应把它表述为没有任何远程 URL。

官方参考：

- [Netlify 手动上传与更新](https://docs.netlify.com/deploy/create-deploys/#drag-and-drop)
- [Netlify 默认站点域名](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/)
- [Netlify CLI 手动部署（可选）](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/#manual-deploys)
