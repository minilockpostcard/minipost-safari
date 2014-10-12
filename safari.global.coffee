commandWasIssued = (event) ->
  if event.command is "minipostWasLaunched"
    {activeTab} = event.target.browserWindow
    if activeTab.url?.match("/minipost/write")
      activeTab.url = location.toString().replace("safari.global", "minipost/unlock")
    else
      activeTab.url = location.toString().replace("safari.global", "minipost/write")

safari.application.addEventListener "command", commandWasIssued, false
