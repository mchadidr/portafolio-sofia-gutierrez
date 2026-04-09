# Images folder

Drop your PNG files here. The site expects them named **`1.png`** through **`17.png`**.

```
public/
└── images/
    ├── 1.png
    ├── 2.png
    ├── ...
    └── 17.png
```

Once the files are here, reference them in the React components as:

```jsx
<img src="/images/1.png" alt="Project 1" />
```

Vite serves everything in `public/` at the root URL, so `/images/1.png`
will resolve correctly both in development (`npm run dev`) and after a
production build (`npm run build`).
