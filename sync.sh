#!/usr/bin/env bash
# 把"任意本地 HTML 文件或文件夹"同步进 text 仓库，自动上线到 GitHub Pages。
# 每次同步后会自动重建根目录 index.html（导航首页），汇总仓库里所有 HTML 页面。
#
# 模式：
#   A. 单文件（只同步指定的那一个文件，不复制整个文件夹）
#      ./sync.sh <本地html文件路径>                # 放到 text 仓库根
#      ./sync.sh <本地html文件路径> 子目录/         # 放到 text/子目录/ 下（文件名沿用源）
#      ./sync.sh <本地html文件路径> event/报名.html # 放到 text/event/报名.html
#
#   B. 整个目录（整体同步）
#      ./sync.sh <本地文件夹路径>                  # 子目录名默认取文件夹名
#      ./sync.sh <本地文件夹路径> 子目录名          # 自定义在 text 仓库里的子目录名
#
#   仅重建导航首页（不改变任何已推送内容）：
#      ./sync.sh --rebuild
#
# 例：
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页/报名.html
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页/报名.html event/
#   ./sync.sh /Users/liuzhaoming/WorkBuddy/其他/我的活动页
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-}"

# 重建导航首页：扫描仓库内所有 *.html（不含 index.html 自身），写入 index.html
rebuild_index() {
  local ITEMS=""
  while IFS= read -r f; do
    f="${f#./}"
    [ "$f" = "index.html" ] && continue
    local path="$f" name="${f%.html}" title
    case "$f" in
      prototype.html) title="知识库管理原型" ;;
      *) title="$name" ;;
    esac
    ITEMS+="      <li><a href=\"$path\"><span class=\"name\">$title</span><span class=\"path\">$path</span></a></li>"$'\n'
  done < <(find . -name '*.html' -not -path './index.html' | sed 's|^\./||' | sort)
  if [ -z "$ITEMS" ]; then
    ITEMS='      <li class="empty">还没有任何页面，用 ./sync.sh 推送你的 HTML 吧。</li>'
  fi
  cat > index.html <<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的网页 · 作品集</title>
  <style>
    :root { --blue:#1677ff; --bg:#f7f8fa; --card:#fff; --border:#e6e8eb; --muted:#8a9099; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
           background:var(--bg); color:#1f2329; }
    header { padding:40px 24px 16px; max-width:920px; margin:0 auto; }
    header h1 { margin:0 0 8px; font-size:26px; }
    header p { margin:0; color:var(--muted); font-size:14px; }
    main { max-width:920px; margin:0 auto; padding:16px 24px 48px; }
    ul#pages { list-style:none; padding:0; margin:0; display:grid;
               grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
    ul#pages li { background:var(--card); border:1px solid var(--border); border-radius:12px;
                  padding:18px 20px; transition:.15s; }
    ul#pages li:hover { border-color:var(--blue); box-shadow:0 4px 16px rgba(22,119,255,.12); }
    ul#pages a { display:block; color:inherit; text-decoration:none; }
    ul#pages .name { font-size:16px; font-weight:600; color:var(--blue); word-break:break-all; }
    ul#pages .path { margin-top:6px; font-size:12px; color:var(--muted); word-break:break-all; }
    .empty { color:var(--muted); font-size:14px; padding:24px 0; }
    footer { max-width:920px; margin:0 auto; padding:0 24px 40px; color:var(--muted); font-size:12px; }
  </style>
</head>
<body>
  <header>
    <h1>我的网页</h1>
    <p>这里汇总了所有推送到本仓库的 HTML 页面，点击即可在线打开。由 sync.sh 自动维护。</p>
  </header>
  <main>
    <ul id="pages">
$ITEMS
    </ul>
  </main>
  <footer>GitHub Pages · 自动生成</footer>
</body>
</html>
HTML
  echo "== 已重建导航首页 index.html =="
}

# 仅重建首页（不带文件）
if [ "$SRC" = "--rebuild" ]; then
  cd "$REPO_DIR"
  rebuild_index
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  git add -A
  if git diff --cached --quiet; then
    echo "导航首页无变化，无需提交。"
  else
    git -c user.name="liuzhaomin" -c user.email="liuzhaomin@users.noreply.github.com" commit -m "Rebuild index.html" 2>&1 | tail -3
    OK=0
    for i in $(seq 1 12); do
      echo "attempt $i"
      if git -c http.version=HTTP/1.1 push -u origin "$BRANCH" 2>&1 | tail -2; then
        if git ls-remote --heads origin "$BRANCH" >/dev/null 2>&1; then OK=1; echo "PUSH_OK"; break; fi
      fi
      sleep 4
    done
    [ "$OK" -eq 1 ] && echo "已推送。导航首页：https://liuzhaomin.github.io/text/" || echo "推送失败，请本机：cd $REPO_DIR && git push"
  fi
  exit 0
fi

if [ -z "$SRC" ]; then
  echo "用法: ./sync.sh <本地文件或文件夹路径> [在text仓库中的目标路径]"
  echo "      ./sync.sh --rebuild   # 仅重建导航首页"
  exit 1
fi
if [ ! -e "$SRC" ]; then
  echo "源不存在: $SRC"; exit 1
fi

DST_ARG="${2:-}"

if [ -f "$SRC" ]; then
  # ---------- 单文件模式 ----------
  if [ -z "$DST_ARG" ]; then
    DEST="$REPO_DIR/$(basename "$SRC")"
  elif [ "${DST_ARG%/}" != "$DST_ARG" ] || [ -d "$REPO_DIR/$DST_ARG" ]; then
    DEST="$REPO_DIR/${DST_ARG%/}/$(basename "$SRC")"
  else
    DEST="$REPO_DIR/$DST_ARG"
  fi
  mkdir -p "$(dirname "$DEST")"
  echo "== 复制文件 $SRC -> $DEST =="
  cp "$SRC" "$DEST"
elif [ -d "$SRC" ]; then
  # ---------- 目录模式（整体同步）----------
  NAME="${DST_ARG:-$(basename "$SRC")}"
  DEST="$REPO_DIR/$NAME"
  echo "== 复制目录 $SRC -> $DEST =="
  rm -rf "$DEST"
  mkdir -p "$DEST"
  cp -R "$SRC/." "$DEST/"
  find "$DEST" -name .git -not -path "$REPO_DIR/.git" -exec rm -rf {} + 2>/dev/null || true
else
  echo "源既不是文件也不是目录: $SRC"; exit 1
fi

cd "$REPO_DIR"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REL="${DEST#$REPO_DIR/}"

# 同步后自动重建导航首页
rebuild_index

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动。"
else
  git -c user.name="liuzhaomin" -c user.email="liuzhaomin@users.noreply.github.com" commit -m "Sync $REL + rebuild index" 2>&1 | tail -3
  echo "已提交"
fi

echo "== 推送到 origin/$BRANCH（代理不稳会自动重试）=="
OK=0
for i in $(seq 1 12); do
  echo "attempt $i"
  if git -c http.version=HTTP/1.1 push -u origin "$BRANCH" 2>&1 | tail -2; then
    if git ls-remote --heads origin "$BRANCH" >/dev/null 2>&1; then OK=1; echo "PUSH_OK"; break; fi
  fi
  sleep 4
done

if [ "$OK" -ne 1 ]; then
  echo "git push 失败，改用 gh api 上传（绕开代理隧道）..."
  api_put() {
    local rpath="$1" localf="$2"
    local b64; b64=$(base64 -i "$localf" | tr -d '\n')
    for j in $(seq 1 8); do
      sha=$(/usr/local/bin/gh api -X PUT "repos/liuzhaomin/text/contents/$rpath" -f message="Sync $rpath" -f content="$b64" -f branch=master --jq '.commit.sha' 2>&1)
      if echo "$sha" | grep -qE '^[0-9a-f]{7,}$'; then echo "OK $rpath -> $sha"; return 0; fi
      echo "  api retry $j: $(echo "$sha" | head -1)"; sleep 3
    done
    return 1
  }
  UPD=0
  api_put "index.html" "index.html" && UPD=1 || true
  if [ -f "$SRC" ]; then
    api_put "$REL" "$DEST" && UPD=1 || true
  else
    while IFS= read -r f; do
      rel="${f#$REPO_DIR/}"
      api_put "$rel" "$f" && UPD=1 || true
    done < <(find "$DEST" -type f)
  fi
  if [ "$UPD" -eq 1 ]; then
    for j in $(seq 1 8); do git -c http.version=HTTP/1.1 fetch origin 2>&1 | tail -1 && break; sleep 4; done
    git reset --hard origin/master 2>&1 | tail -1 || echo "请本机执行 git pull --rebase"
  fi
  OK="$UPD"
fi

echo ""
if [ "$OK" -eq 1 ]; then
  echo "完成。导航首页："
  echo "  https://liuzhaomin.github.io/text/"
  echo "本次页面："
  echo "  https://liuzhaomin.github.io/text/$REL"
else
  echo "推送未成功（多半是网络代理问题）。请在你的 Mac 终端直接重试："
  echo "  cd $REPO_DIR && git push"
fi
