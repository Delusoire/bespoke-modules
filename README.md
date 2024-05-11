Get-ChildItem -Path . -Filter metadata.json -Recurse | ForEach-Object {
	& bespoke pkg install --local $_.FullName
}
