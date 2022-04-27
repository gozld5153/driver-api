# Goochoori-api

Steps to run:

1. Run `yarn` command
2. Setup `.env` file
3. Run `yarn dev` or `yarn start` command

---

```
mysql> UPDATE place  SET point = ST_GeomFromText(ST_AsText(point), 4326);
ERROR 3617 (22S03): Latitude 127.614066 is out of range in function st_geomfromtext. It must be within [-90.000000, 90.000000].

mysql> select *, ST_astext(point) from place;
+----+--------------------+--------------------+------------------------------------------------------+----------------------------------------------+
| id | latitude           | longitude          | point                                                | ST_astext(point)                             |
+----+--------------------+--------------------+------------------------------------------------------+----------------------------------------------+
|  1 |  37.63834402322471 | 127.61406615168869 | 0x00000000010100000058C51DDC4CE75F4071ACC741B5D14240 | POINT(127.61406615168869 37.63834402322471)  |
|  2 |  36.37288489577353 | 127.07328582850272 | 0x0000000001010000007C2B0BB7B0C45F40854238B1BA2F4240 | POINT(127.07328582850272 36.37288489577353)  |
```
