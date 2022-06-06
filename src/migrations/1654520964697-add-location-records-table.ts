import { MigrationInterface, QueryRunner } from "typeorm";

export class addLocationRecordsTable1654520964697 implements MigrationInterface {
    name = 'addLocationRecordsTable1654520964697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`location_records\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userRole\` varchar(255) NOT NULL, \`latitude\` int NOT NULL, \`longitude\` int NOT NULL, \`platform\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`location_records\` ADD CONSTRAINT \`FK_5eff5090cb24369656f2b4b8213\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location_records\` DROP FOREIGN KEY \`FK_5eff5090cb24369656f2b4b8213\``);
        await queryRunner.query(`DROP TABLE \`location_records\``);
    }

}
