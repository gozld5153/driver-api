import {MigrationInterface, QueryRunner} from "typeorm";

export class addUsersPlacesTables1651274113219 implements MigrationInterface {
    name = 'addUsersPlacesTables1651274113219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`places\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('hospital') NOT NULL DEFAULT 'hospital', \`latitude\` double NOT NULL, \`longitude\` double NOT NULL, \`point\` point NOT NULL, SPATIAL INDEX \`IDX_0964453b430bf7f2bfc4378983\` (\`point\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_0964453b430bf7f2bfc4378983\` ON \`places\``);
        await queryRunner.query(`DROP TABLE \`places\``);
    }

}
