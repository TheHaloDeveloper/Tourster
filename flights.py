import base64

string = '''CBwQAhoeEgoyMDI0LTA1LTI4agcIARIDVFBFcgcIARIDTVlK    Gh4SCjIwMjQtMDUtMzBqBwgBEgNNWUpyBwgBEgNUUEVAAUgBcAGCAQsI____________AZgBAQ'''
string += "=" * ((4 - len(string) % 4) % 4)
print(base64.b64decode(string))