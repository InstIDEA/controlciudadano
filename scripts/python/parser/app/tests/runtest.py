from sys import argv
from json import loads
from json import dumps
from requests import post
from datetime import datetime

if __name__ == '__main__':
	err = { }
	failed = 0
	if len(argv) > 1:
		with open(argv[1], 'r') as f:
			lines = f.readlines()
			for count, line in enumerate(lines, start=1):
				if '#' in line:
					continue
				print('{0} [{1}/{2}]'.format(line.strip("\n"), count, len(lines)))
				payload = {'file': { 'path': line.strip('\n') } }
				r = post("http://localhost/parser/send", data=dumps(payload))
				if r.status_code != 200:
					failed += 1
				else:
					d = loads(r.text)
					if d['message']:
						for item in d['message']:
							if not item in err:
								err.update({ item: { 'count': 1, 'file': [line.strip('\n'),] } })
								break
							err.update({ item: { 'count': sum([err[item]['count'], ], 1), 'file': [*err[item]['file'], line.strip('\n')] } })
			print(f'requests failed {failed}/{len(lines)}')
		err.update({ "summary": dict(zip([item for item in err.keys()], [item['count'] for item in err.values()])) })
		timestamp = datetime.now().strftime("%d-%M-%Y %H:%M:%S")
		with open('./test.txt', 'a') as f:
			f.write(f'[{timestamp}]\n')
			f.write(dumps(err, indent='\t'))
			f.write('\n\n')