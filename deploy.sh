#!/usr/bin/env bash
# 一键同步本地改动到 GitHub，并自动触发 GitHub Pages 部署（网页更新）。
# 用法：  ./deploy.sh           # 用默认 commit 信息
#        ./deploy.sh "说明文字"  # 自定义 commit 信息
set -e
cd "$(dirname "$0")"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
MSG="${1:-deploy: $(date '+%Y-%m-%d %H:%M:%S')}"

git add -A
if git diff --cached --quiet; then
  echo "没有改动，跳过提交。"
else
  git -c user.name="liuzhaomin" -c user.email="liuzhaomin@users.noreply.github.com" commit -m "$MSG"
  echo "已提交: $MSG"
fi

echo "== 推送到 origin/$BRANCH（沙箱代理不稳会自动重试）=="
for i in $(seq 1 12); do
  echo "attempt $i"
  if git -c http.version=HTTP/1.1 push -u origin "$BRANCH" 2>&1 | tail -2; then
    if git ls-remote --heads origin "$BRANCH" >/dev/null 2>&1; then
      echo "PUSH_OK"; break
    fi
  fi
  sleep 4
done

echo ""
echo "完成。GitHub Pages 将在 1~2 分钟后更新："
echo "  https://liuzhaomin.github.io/text/"
