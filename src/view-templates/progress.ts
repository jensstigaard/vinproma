export default (type: string, theme: string = 'light') => {
  const parts = [
    `
	<!DOCTYPE html>
	<html lang="en">
	
	<head>
		<meta charset="utf-8">
		<title>vinproma &ndash; vMix Input Progress Monitor</title>
		<link rel="stylesheet" href="/css/app.css">
		`,
    // Inject CSS for dark theme if dark theme desired
    theme === 'dark' ? '<link rel="stylesheet" href="/css/dark.css">' : '',
    `
	</head>
	
	<body>
		<div id="app">
			<div></div>
		</div>
	
		<script src="/js/app.js"></script>
	</body>
	
	</html>
	`
  ]

  return parts.join('')
}
