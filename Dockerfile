FROM oven/bun:1-alpine

WORKDIR /app

COPY proxy.mjs .

ENV PROXY_PORT=9999
ENV CLAUDE_CODE_VERSION=1.0.57

EXPOSE 9999

CMD ["bun", "run", "proxy.mjs"]
