import sqlite3

#Assumes that the first two columns are string values and the rest are integer values
#Hard coded to skip second row to allow for notes

#get date and rename file with current date in name

conn = sqlite3.connect("data.sqlite")
cur = conn.cursor()
f = open('hobbyList.csv')
firstLine = f.readline()
columns = firstLine.split(",")

f.readline()    #This is what skips the second row, and moves the pointer to the third row

command = "CREATE TABLE hobby ("
for i, value in enumerate(columns):
    if i == 0 or i == 1:
        command += value + " varchar(255)"
    else:
        command += value + " int"
    if i != len(columns)-1:
        command += ","
command += ");"

conn.execute(command) 

while True:
    line = f.readline()
    if line == "":
        break
    data = line.split(",")
    insert = "INSERT INTO hobby ("
    for i, value in enumerate(columns):
        insert += value
        if i != len(columns) - 1:
            insert += ", "
    insert += ") VALUES ("
    for i, value in enumerate(data):
        if i == 0 or i == 1:
            insert += "'" + value + "'"
        else:
            insert += value
            if value == "":
                insert += "NULL"
        if i != len(columns)-1:
            insert += ", "
    insert += ");"
    print(insert)
    cur.execute(insert)
    conn.commit()
