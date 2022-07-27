import { MigrationInterface, QueryRunner } from "typeorm";

export class addReservationsTable1658896793787 implements MigrationInterface {
    name = 'addReservationsTable1658896793787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_4f3e4d2bd7c70f828e02233316\` ON \`users\``);
        await queryRunner.query(`CREATE TABLE \`reservations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`isEvent\` tinyint NOT NULL, \`dueDate\` datetime NOT NULL, \`dueEndDate\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`departureId\` int NULL, \`destinationId\` int NULL, \`driverId\` int NULL, \`heroId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_b0b1429a277ca1c56c1b7e94fc8\` FOREIGN KEY (\`departureId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_85b836c3a1d98d1a4ab4b9535c0\` FOREIGN KEY (\`destinationId\`) REFERENCES \`places\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_01358135349eebc2111cbebb990\` FOREIGN KEY (\`driverId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservations\` ADD CONSTRAINT \`FK_aaa286dc80c80ace96195fd8308\` FOREIGN KEY (\`heroId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_aaa286dc80c80ace96195fd8308\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_01358135349eebc2111cbebb990\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_85b836c3a1d98d1a4ab4b9535c0\``);
        await queryRunner.query(`ALTER TABLE \`reservations\` DROP FOREIGN KEY \`FK_b0b1429a277ca1c56c1b7e94fc8\``);
        await queryRunner.query(`DROP TABLE \`reservations\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_4f3e4d2bd7c70f828e02233316\` ON \`users\` (\`friendId\`)`);
    }

}
